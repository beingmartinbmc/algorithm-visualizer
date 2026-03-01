import { useState, useCallback, useRef } from 'react';
import type { AlgorithmType, GridMatrix, VisualizationSpeed } from '../types/graph';
import { NodeType, SPEED_MAP } from '../types/graph';
import { runAlgorithm } from '../algorithms';
import { useSound } from '@/hooks/useSound';

interface UseVisualizationProps {
  grid: GridMatrix;
  startPos: { row: number; col: number };
  endPos: { row: number; col: number };
  setNodeType: (row: number, col: number, type: NodeType) => void;
  clearVisualization: () => void;
}

export function useVisualization({
  grid,
  startPos,
  endPos,
  setNodeType,
  clearVisualization,
}: UseVisualizationProps) {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs');
  const [speed, setSpeed] = useState<VisualizationSpeed>('fast');
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timeoutsRef = useRef<number[]>([]);
  const { playVisitedTone, playPathTone, playCompleteTone, setEnabled } = useSound();

  const toggleSound = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, [setEnabled]);

  const stopVisualization = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    setIsRunning(false);
  }, []);

  const visualize = useCallback(() => {
    stopVisualization();
    clearVisualization();
    setIsFinished(false);
    setVisitedCount(0);
    setPathLength(0);

    const result = runAlgorithm(algorithm, grid, startPos, endPos);
    const { visitedNodesInOrder, shortestPath } = result;
    const delay = SPEED_MAP[speed];
    const totalRows = grid.length;
    const totalCols = grid[0].length;

    setIsRunning(true);

    if (delay === 0) {
      for (const node of visitedNodesInOrder) {
        if (node.type !== NodeType.START && node.type !== NodeType.END) {
          setNodeType(node.row, node.col, NodeType.VISITED);
        }
      }
      for (const node of shortestPath) {
        if (node.type !== NodeType.START && node.type !== NodeType.END) {
          setNodeType(node.row, node.col, NodeType.PATH);
        }
      }
      setVisitedCount(visitedNodesInOrder.length);
      setPathLength(shortestPath.length);
      setIsRunning(false);
      setIsFinished(true);
      playCompleteTone(shortestPath.length > 0);
      return;
    }

    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const timeout = window.setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (node.type !== NodeType.START && node.type !== NodeType.END) {
          setNodeType(node.row, node.col, NodeType.VISITED);
        }
        playVisitedTone(node.row, node.col, totalRows, totalCols, speed);
        setVisitedCount(i + 1);

        if (i === visitedNodesInOrder.length - 1) {
          for (let j = 0; j < shortestPath.length; j++) {
            const pathTimeout = window.setTimeout(() => {
              const pathNode = shortestPath[j];
              if (pathNode.type !== NodeType.START && pathNode.type !== NodeType.END) {
                setNodeType(pathNode.row, pathNode.col, NodeType.PATH);
              }
              playPathTone(j, shortestPath.length, speed);
              setPathLength(j + 1);
              if (j === shortestPath.length - 1) {
                setIsRunning(false);
                setIsFinished(true);
                playCompleteTone(true);
              }
            }, delay * 3 * j);
            timeoutsRef.current.push(pathTimeout);
          }

          if (shortestPath.length === 0) {
            setIsRunning(false);
            setIsFinished(true);
            playCompleteTone(false);
          }
        }
      }, delay * i);
      timeoutsRef.current.push(timeout);
    }

    if (visitedNodesInOrder.length === 0) {
      setIsRunning(false);
      setIsFinished(true);
    }
  }, [algorithm, grid, startPos, endPos, speed, setNodeType, clearVisualization, stopVisualization, playVisitedTone, playPathTone, playCompleteTone]);

  return {
    algorithm,
    setAlgorithm,
    speed,
    setSpeed,
    isRunning,
    isFinished,
    visitedCount,
    pathLength,
    soundEnabled,
    toggleSound,
    visualize,
    stopVisualization,
  };
}
