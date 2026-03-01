import { useState, useCallback, useRef } from 'react';
import type { TreeNode, TraversalType, TraversalStep } from '../types/tree';
import { generateRandomTree, getTreeNodes } from '../algorithms/generator';
import { runTraversal } from '../algorithms/traversals';
import { useTreeSound } from './useTreeSound';

export function useTreeTraversal() {
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
  const [nodeCount, setNodeCount] = useState(15);
  const [root, setRoot] = useState<TreeNode | null>(() => generateRandomTree(15));
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const intervalRef = useRef<number | null>(null);
  const [processOrder, setProcessOrder] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playVisitTone, playProcessTone, playCompleteSweep, setEnabled } = useTreeSound();

  const toggleSound = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, [setEnabled]);

  const generateNew = useCallback((count?: number) => {
    const c = count ?? nodeCount;
    if (count !== undefined) setNodeCount(count);
    const tree = generateRandomTree(c);
    setRoot(tree);
    setSteps([]);
    setStepIndex(-1);
    setVisitedIds(new Set());
    setProcessedIds(new Set());
    setCurrentId(null);
    setProcessOrder([]);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPlaying(false);
  }, [nodeCount]);

  const initSteps = useCallback(() => {
    if (steps.length > 0) return steps;
    const s = runTraversal(root, traversalType);
    setSteps(s);
    return s;
  }, [steps, root, traversalType]);

  const applyStep = useCallback((allSteps: TraversalStep[], idx: number, withSound = true) => {
    const visited = new Set<number>();
    const processed = new Set<number>();
    const order: number[] = [];
    for (let i = 0; i <= idx; i++) {
      const step = allSteps[i];
      visited.add(step.nodeId);
      if (step.action === 'process') {
        processed.add(step.nodeId);
        if (!order.includes(step.nodeId)) order.push(step.nodeId);
      }
    }
    setVisitedIds(visited);
    setProcessedIds(processed);
    setCurrentId(allSteps[idx].nodeId);
    setProcessOrder(order);

    if (withSound) {
      const step = allSteps[idx];
      const totalNodes = root ? getTreeNodes(root).length : 1;
      if (step.action === 'visit') {
        playVisitTone(step.nodeId, totalNodes);
      } else if (step.action === 'process') {
        playProcessTone(step.nodeId, totalNodes);
      }
    }
  }, [root, playVisitTone, playProcessTone]);

  const nextStep = useCallback(() => {
    const allSteps = initSteps();
    if (allSteps.length === 0) return;
    setStepIndex((prev) => {
      const next = Math.min(prev + 1, allSteps.length - 1);
      applyStep(allSteps, next, true);
      return next;
    });
  }, [initSteps, applyStep]);

  const prevStep = useCallback(() => {
    if (stepIndex <= 0) {
      setStepIndex(-1);
      setVisitedIds(new Set());
      setProcessedIds(new Set());
      setCurrentId(null);
      setProcessOrder([]);
      return;
    }
    setStepIndex((prev) => {
      const next = prev - 1;
      applyStep(steps, next, false);
      return next;
    });
  }, [stepIndex, steps, applyStep]);

  const stopPlaying = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const allSteps = initSteps();
    if (allSteps.length === 0) return;
    setIsPlaying(true);

    let idx = stepIndex;
    intervalRef.current = window.setInterval(() => {
      idx++;
      if (idx >= allSteps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        playCompleteSweep(allSteps.length);
        return;
      }
      setStepIndex(idx);
      applyStep(allSteps, idx, true);
    }, speed);
  }, [initSteps, stepIndex, speed, applyStep]);

  const reset = useCallback(() => {
    stopPlaying();
    setSteps([]);
    setStepIndex(-1);
    setVisitedIds(new Set());
    setProcessedIds(new Set());
    setCurrentId(null);
    setProcessOrder([]);
  }, [stopPlaying]);

  const changeTraversalType = useCallback((type: TraversalType) => {
    reset();
    setTraversalType(type);
  }, [reset]);

  const canGoNext = stepIndex < steps.length - 1 || steps.length === 0;
  const canGoPrev = stepIndex >= 0;
  const isFinished = steps.length > 0 && stepIndex === steps.length - 1;

  return {
    traversalType,
    setTraversalType: changeTraversalType,
    nodeCount,
    root,
    stepIndex,
    totalSteps: steps.length,
    visitedIds,
    processedIds,
    currentId,
    processOrder,
    isPlaying,
    isFinished,
    speed,
    setSpeed,
    soundEnabled,
    toggleSound,
    canGoNext,
    canGoPrev,
    generateNew,
    nextStep,
    prevStep,
    play,
    stopPlaying,
    reset,
  };
}
