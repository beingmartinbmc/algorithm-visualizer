import { useState, useCallback, useRef } from 'react';
import type { BTreeNode, TreeType, TreeStep } from '../types/balancedTree';
import { bstInsert, bstDelete, createBSTFromValues } from '../algorithms/bst';
import { avlInsert, avlDelete, createAVLFromValues } from '../algorithms/avl';
import { rbInsert, rbDelete, createRBFromValues } from '../algorithms/rbtree';

function randomValues(count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * 99) + 1);
  }
  return [...set];
}

function buildTree(type: TreeType, values: number[]): BTreeNode | null {
  switch (type) {
    case 'bst': return createBSTFromValues(values);
    case 'avl': return createAVLFromValues(values);
    case 'rbtree': return createRBFromValues(values);
  }
}

export function useBalancedTree() {
  const [treeType, setTreeType] = useState<TreeType>('bst');
  const [root, setRoot] = useState<BTreeNode | null>(() => createBSTFromValues(randomValues(7)));
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [speed, setSpeed] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const currentSnapshot = stepIndex >= 0 && stepIndex < steps.length
    ? steps[stepIndex].snapshotRoot
    : null;
  const displayRoot = currentSnapshot ?? root;
  const highlightIds = stepIndex >= 0 && stepIndex < steps.length
    ? steps[stepIndex].highlightIds
    : [];
  const description = stepIndex >= 0 && stepIndex < steps.length
    ? steps[stepIndex].description
    : '';

  const changeTreeType = useCallback((type: TreeType) => {
    setTreeType(type);
    const tree = buildTree(type, randomValues(7));
    setRoot(tree);
    setSteps([]);
    setStepIndex(-1);
    setHistory([]);
  }, []);

  const generateRandom = useCallback(() => {
    const tree = buildTree(treeType, randomValues(7));
    setRoot(tree);
    setSteps([]);
    setStepIndex(-1);
    setHistory([]);
  }, [treeType]);

  const stopPlaying = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPlaying(false);
  }, []);

  const autoPlaySteps = useCallback((allSteps: TreeStep[], finalRoot: BTreeNode | null, label: string) => {
    stopPlaying();
    setSteps(allSteps);
    setStepIndex(0);
    setIsPlaying(true);
    setHistory((prev) => [...prev, label]);

    let idx = 0;
    intervalRef.current = window.setInterval(() => {
      idx++;
      if (idx >= allSteps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        setStepIndex(allSteps.length - 1);
        setRoot(finalRoot);
        return;
      }
      setStepIndex(idx);
    }, speed);
  }, [speed, stopPlaying]);

  const doInsert = useCallback((value: number) => {
    let result: { root: BTreeNode; steps: TreeStep[] };
    switch (treeType) {
      case 'bst': result = bstInsert(root, value); break;
      case 'avl': result = avlInsert(root, value); break;
      case 'rbtree': result = rbInsert(root, value); break;
    }
    autoPlaySteps(result.steps, result.root, `Insert ${value}`);
  }, [treeType, root, autoPlaySteps]);

  const doDelete = useCallback((value: number) => {
    let result: { root: BTreeNode | null; steps: TreeStep[] };
    switch (treeType) {
      case 'bst': result = bstDelete(root, value); break;
      case 'avl': result = avlDelete(root, value); break;
      case 'rbtree': result = rbDelete(root, value); break;
    }
    autoPlaySteps(result.steps, result.root, `Delete ${value}`);
  }, [treeType, root, autoPlaySteps]);

  const nextStep = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  }, [stepIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  const canGoNext = stepIndex < steps.length - 1;
  const canGoPrev = stepIndex > 0;

  return {
    treeType,
    changeTreeType,
    root,
    displayRoot,
    highlightIds,
    description,
    steps,
    stepIndex,
    canGoNext,
    canGoPrev,
    inputValue,
    setInputValue,
    history,
    speed,
    setSpeed,
    isPlaying,
    generateRandom,
    doInsert,
    doDelete,
    nextStep,
    prevStep,
  };
}
