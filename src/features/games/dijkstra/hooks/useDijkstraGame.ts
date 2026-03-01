import { useState, useCallback, useRef, useEffect } from 'react';
import type { DijkstraGameMode, GameGraph, DijkstraStep } from '../types/dijkstra';
import { generatePredefinedMap, generateRandomMap, getAdjacentNodes } from '../engine/graphGenerator';
import { runDijkstra, getOptimalCost, computePlayerCost, computeScore } from '../engine/dijkstra';
import { useDijkstraSound } from './useDijkstraSound';

export function useDijkstraGame() {
  const [mode, setMode] = useState<DijkstraGameMode>('explore');
  const [graph, setGraph] = useState<GameGraph>(() => generatePredefinedMap(0));
  const [mapType, setMapType] = useState<'predefined' | 'random'>('predefined');
  const [mapIndex, setMapIndex] = useState(0);

  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const [playerPath, setPlayerPath] = useState<string[]>([]);
  const [playerCost, setPlayerCost] = useState(0);
  const [optimalPath, setOptimalPath] = useState<string[]>([]);
  const [optimalCost, setOptimalCost] = useState(0);
  const [showOptimal, setShowOptimal] = useState(false);

  const [algoSteps, setAlgoSteps] = useState<DijkstraStep[]>([]);
  const [algoStepIndex, setAlgoStepIndex] = useState(-1);
  const [isAlgoRunning, setIsAlgoRunning] = useState(false);
  const algoTimerRef = useRef<number | null>(null);
  const [algoSpeed, setAlgoSpeed] = useState(500);

  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [selectingPhase, setSelectingPhase] = useState<'start' | 'end' | 'path'>('start');

  const { playVisitTone, playRelaxTone, playClickTone, playErrorTone, playCompleteSweep, setEnabled } = useDijkstraSound();

  const toggleSound = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, [setEnabled]);

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => setTimer((p) => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  const currentAlgoStep: DijkstraStep | null = algoStepIndex >= 0 && algoStepIndex < algoSteps.length ? algoSteps[algoStepIndex] : null;

  const clickNode = useCallback((nodeId: string) => {
    setLastError(null);

    if (selectingPhase === 'start') {
      setStartNode(nodeId);
      setSelectingPhase('end');
      playClickTone();
      return;
    }

    if (selectingPhase === 'end') {
      if (nodeId === startNode) {
        setLastError('Destination must be different from start');
        playErrorTone();
        return;
      }
      setEndNode(nodeId);
      playClickTone();

      // Compute optimal
      const opt = getOptimalCost(graph, startNode!, nodeId);
      setOptimalPath(opt.path);
      setOptimalCost(opt.cost);

      if (mode === 'visualize') {
        const steps = runDijkstra(graph, startNode!, nodeId);
        setAlgoSteps(steps);
        setAlgoStepIndex(-1);
        setSelectingPhase('path');
      } else {
        setPlayerPath([startNode!]);
        setPlayerCost(0);
        setSelectingPhase('path');
        if (mode === 'race') {
          setIsTimerRunning(true);
          setTimer(0);
        }
      }
      return;
    }

    // Path building mode (explore/race)
    if (mode === 'visualize') return;

    if (playerPath.length === 0) return;
    const lastNode = playerPath[playerPath.length - 1];

    if (nodeId === lastNode) return;

    // Check adjacency
    const adjacent = getAdjacentNodes(graph, lastNode);
    const neighbor = adjacent.find((n) => n.id === nodeId);

    if (!neighbor) {
      setLastError(`${nodeId} is not adjacent to ${lastNode}`);
      playErrorTone();
      setTimeout(() => setLastError(null), 1500);
      return;
    }

    playClickTone();
    const newPath = [...playerPath, nodeId];
    const newCost = playerCost + neighbor.weight;
    setPlayerPath(newPath);
    setPlayerCost(newCost);

    if (nodeId === endNode) {
      setIsComplete(true);
      setIsTimerRunning(false);
      setShowOptimal(true);
      if (mode === 'race') {
        const s = computeScore(newCost, optimalCost, timer);
        setScore(s);
        playCompleteSweep(newCost === optimalCost);
      } else {
        playCompleteSweep(true);
      }
    }
  }, [selectingPhase, startNode, endNode, graph, mode, playerPath, playerCost, optimalCost, timer, playClickTone, playErrorTone, playCompleteSweep]);

  const undoLastStep = useCallback(() => {
    if (playerPath.length <= 1 || isComplete) return;
    const prev = playerPath.slice(0, -1);
    setPlayerPath(prev);
    setPlayerCost(computePlayerCost(graph, prev));
    setLastError(null);
  }, [playerPath, graph, isComplete]);

  // Algo visualization controls
  const stepAlgoForward = useCallback(() => {
    if (algoSteps.length === 0) return;
    setAlgoStepIndex((prev) => {
      const next = Math.min(prev + 1, algoSteps.length - 1);
      const step = algoSteps[next];
      if (step.type === 'visit') playVisitTone(next);
      if (step.type === 'relax') playRelaxTone();
      if (step.type === 'done') playCompleteSweep(true);
      return next;
    });
  }, [algoSteps, playVisitTone, playRelaxTone, playCompleteSweep]);

  const stepAlgoBack = useCallback(() => {
    setAlgoStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const autoPlayAlgo = useCallback(() => {
    if (isAlgoRunning) {
      if (algoTimerRef.current) clearInterval(algoTimerRef.current);
      setIsAlgoRunning(false);
      return;
    }
    setIsAlgoRunning(true);
    let idx = algoStepIndex < 0 ? 0 : algoStepIndex;

    algoTimerRef.current = window.setInterval(() => {
      if (idx >= algoSteps.length - 1) {
        if (algoTimerRef.current) clearInterval(algoTimerRef.current);
        setIsAlgoRunning(false);
        return;
      }
      idx++;
      setAlgoStepIndex(idx);
      const step = algoSteps[idx];
      if (step.type === 'visit') playVisitTone(idx);
      if (step.type === 'relax') playRelaxTone();
      if (step.type === 'done') playCompleteSweep(true);
    }, algoSpeed);
  }, [isAlgoRunning, algoStepIndex, algoSteps, algoSpeed, playVisitTone, playRelaxTone, playCompleteSweep]);

  const resetGame = useCallback(() => {
    setStartNode(null);
    setEndNode(null);
    setPlayerPath([]);
    setPlayerCost(0);
    setOptimalPath([]);
    setOptimalCost(0);
    setShowOptimal(false);
    setAlgoSteps([]);
    setAlgoStepIndex(-1);
    setIsAlgoRunning(false);
    setScore(0);
    setTimer(0);
    setIsTimerRunning(false);
    setIsComplete(false);
    setLastError(null);
    setSelectingPhase('start');
    if (algoTimerRef.current) clearInterval(algoTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    // Reset graph node distances
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) => ({ ...n, distance: Infinity, visited: false, previous: null })),
    }));
  }, []);

  const changeMode = useCallback((newMode: DijkstraGameMode) => {
    setMode(newMode);
    resetGame();
  }, [resetGame]);

  const newMap = useCallback((type: 'predefined' | 'random') => {
    setMapType(type);
    if (type === 'predefined') {
      const next = (mapIndex + 1) % 3;
      setMapIndex(next);
      setGraph(generatePredefinedMap(next));
    } else {
      setGraph(generateRandomMap(12));
    }
    resetGame();
  }, [mapIndex, resetGame]);

  const toggleOptimal = useCallback(() => {
    if (!startNode || !endNode) return;
    setShowOptimal((p) => !p);
  }, [startNode, endNode]);

  return {
    mode,
    graph,
    mapType,
    startNode,
    endNode,
    playerPath,
    playerCost,
    optimalPath,
    optimalCost,
    showOptimal,
    algoSteps,
    algoStepIndex,
    currentAlgoStep,
    isAlgoRunning,
    algoSpeed,
    setAlgoSpeed,
    score,
    timer,
    isComplete,
    lastError,
    soundEnabled,
    selectingPhase,
    clickNode,
    undoLastStep,
    stepAlgoForward,
    stepAlgoBack,
    autoPlayAlgo,
    resetGame,
    changeMode,
    newMap,
    toggleOptimal,
    toggleSound,
  };
}
