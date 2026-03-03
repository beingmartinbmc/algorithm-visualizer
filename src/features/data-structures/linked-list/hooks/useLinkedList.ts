import { useState, useCallback, useRef } from 'react';

export interface ListNode {
  id: number;
  value: number;
}

export type LLHighlightColor = 'green' | 'red' | 'yellow' | 'blue';

export interface LLStep {
  description: string;
  nodes: ListNode[];
  highlightIds: Set<number>;
  highlightColor: LLHighlightColor | null;
  newNodeId: number | null;
}

let nextId = 1;

const INITIAL_NODES: ListNode[] = [3, 7, 1, 9].map((v) => ({
  id: nextId++,
  value: v,
}));

export function useLinkedList() {
  const [nodes, setNodes] = useState<ListNode[]>(INITIAL_NODES);
  const [steps, setSteps] = useState<LLStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [indexValue, setIndexValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [speed, setSpeed] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayNodes = stepIndex >= 0 && steps[stepIndex] ? steps[stepIndex].nodes : nodes;
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;

  const addHistory = (msg: string) => setHistory((h) => [msg, ...h].slice(0, 20));

  const makeStep = (
    description: string,
    ns: ListNode[],
    highlightIds: number[] = [],
    highlightColor: LLHighlightColor | null = null,
    newNodeId: number | null = null,
  ): LLStep => ({
    description,
    nodes: ns,
    highlightIds: new Set(highlightIds),
    highlightColor,
    newNodeId,
  });

  const prepend = useCallback((val: number) => {
    const newNode: ListNode = { id: nextId++, value: val };
    setNodes((prev) => {
      const next = [newNode, ...prev];
      const built: LLStep[] = [
        makeStep(`Prepend ${val}: creating new node at head...`, prev, [], null, newNode.id),
        makeStep(`${val} inserted at position 0 (head). Updating head pointer.`, next, [newNode.id], 'green', newNode.id),
      ];
      setSteps(built);
      setStepIndex(1);
      addHistory(`Prepend ${val}`);
      return next;
    });
  }, []);

  const append = useCallback((val: number) => {
    const newNode: ListNode = { id: nextId++, value: val };
    setNodes((prev) => {
      const next = [...prev, newNode];
      const built: LLStep[] = [];

      // Traverse steps
      for (let i = 0; i < prev.length; i++) {
        built.push(makeStep(
          `Traversing to tail: at node ${prev[i].value} (index ${i})...`,
          prev,
          [prev[i].id],
          'yellow',
        ));
      }
      built.push(makeStep(
        `Append ${val}: attaching new node at tail.`,
        next,
        [newNode.id],
        'green',
        newNode.id,
      ));
      setSteps(built);
      setStepIndex(built.length - 1);
      addHistory(`Append ${val}`);
      return next;
    });
  }, []);

  const insertAt = useCallback((val: number, idx: number) => {
    const newNode: ListNode = { id: nextId++, value: val };
    setNodes((prev) => {
      if (idx < 0 || idx > prev.length) return prev;
      const next = [...prev.slice(0, idx), newNode, ...prev.slice(idx)];
      const built: LLStep[] = [];

      for (let i = 0; i < idx; i++) {
        built.push(makeStep(
          `Traversing to index ${idx}: at node ${prev[i].value} (index ${i})...`,
          prev,
          [prev[i].id],
          'yellow',
        ));
      }
      built.push(makeStep(
        `Insert ${val} at index ${idx}: re-linking pointers.`,
        next,
        [newNode.id],
        'green',
        newNode.id,
      ));
      setSteps(built);
      setStepIndex(built.length - 1);
      addHistory(`Insert ${val} at [${idx}]`);
      return next;
    });
  }, []);

  const deleteAt = useCallback((idx: number) => {
    setNodes((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const target = prev[idx];
      const built: LLStep[] = [];

      for (let i = 0; i <= idx; i++) {
        built.push(makeStep(
          `Traversing to index ${idx}: at node ${prev[i].value}...`,
          prev,
          [prev[i].id],
          'yellow',
        ));
      }
      built.push(makeStep(
        `Deleting node ${target.value} at index ${idx}: re-linking pointers.`,
        prev,
        [target.id],
        'red',
      ));
      const next = prev.filter((_, i) => i !== idx);
      built.push(makeStep(
        `Node ${target.value} removed. List size: ${next.length}`,
        next,
        [],
        null,
      ));
      setSteps(built);
      setStepIndex(built.length - 1);
      addHistory(`Delete [${idx}] → ${target.value}`);
      return next;
    });
  }, []);

  const search = useCallback((val: number) => {
    setNodes((prev) => {
      const built: LLStep[] = [];
      let foundIdx = -1;

      for (let i = 0; i < prev.length; i++) {
        const isMatch = prev[i].value === val;
        built.push(makeStep(
          `Checking index ${i}: ${prev[i].value} ${isMatch ? '== ' + val + ' ✓ Found!' : '≠ ' + val}`,
          prev,
          [prev[i].id],
          isMatch ? 'green' : 'yellow',
        ));
        if (isMatch) { foundIdx = i; break; }
      }
      if (foundIdx === -1) {
        built.push(makeStep(`${val} not found in the list.`, prev, [], null));
        addHistory(`Search ${val} → not found`);
      } else {
        addHistory(`Search ${val} → found at [${foundIdx}]`);
      }
      setSteps(built);
      setStepIndex(built.length - 1);
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setNodes([]);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Clear list');
  }, []);

  const generateRandom = useCallback(() => {
    const size = Math.floor(Math.random() * 4) + 4;
    const items: ListNode[] = Array.from({ length: size }, () => ({
      id: nextId++,
      value: Math.floor(Math.random() * 90) + 1,
    }));
    setNodes(items);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Random list');
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const autoPlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (stepIndex >= steps.length - 1) return;
    setIsPlaying(true);
    let idx = stepIndex;
    const tick = () => {
      if (idx >= steps.length - 1) { setIsPlaying(false); return; }
      idx++;
      setStepIndex(idx);
      timerRef.current = setTimeout(tick, speed);
    };
    timerRef.current = setTimeout(tick, speed);
  }, [isPlaying, stepIndex, steps.length, speed]);

  return {
    nodes,
    displayNodes,
    steps,
    stepIndex,
    currentStep,
    inputValue,
    setInputValue,
    indexValue,
    setIndexValue,
    history,
    speed,
    setSpeed,
    isPlaying,
    prepend,
    append,
    insertAt,
    deleteAt,
    search,
    clear,
    generateRandom,
    nextStep,
    prevStep,
    autoPlay,
    canGoNext: stepIndex < steps.length - 1,
    canGoPrev: stepIndex > 0,
  };
}
