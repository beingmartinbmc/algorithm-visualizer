import { useState, useCallback, useRef, useEffect } from 'react';
import { useDSSound } from '../../hooks/useDSSound';

export interface StackItem {
  id: number;
  value: number;
}

export interface StackStep {
  description: string;
  stack: StackItem[];
  highlightIndex: number | null;
  highlightColor: 'green' | 'red' | 'yellow' | null;
}

let nextId = 1;

const INITIAL_STACK: StackItem[] = [
  { id: nextId++, value: 3 },
  { id: nextId++, value: 7 },
  { id: nextId++, value: 1 },
];

export function useStack() {
  const [stack, setStack] = useState<StackItem[]>(INITIAL_STACK);
  const [steps, setSteps] = useState<StackStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [speed, setSpeed] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(speed);
  const pendingAutoPlay = useRef(false);
  const { soundEnabled, toggleSound, playInsert, playDelete, playAccess, playTraverse } = useDSSound();
  const playStepSoundRef = useRef<(idx: number, stepsArr: StackStep[]) => void>(() => {});

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (!pendingAutoPlay.current || steps.length === 0) return;
    pendingAutoPlay.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(true);
    let idx = 0;
    const tick = () => {
      if (idx >= steps.length - 1) { setIsPlaying(false); return; }
      idx++;
      setStepIndex(idx);
      playStepSoundRef.current(idx, steps);
      timerRef.current = setTimeout(tick, speedRef.current);
    };
    timerRef.current = setTimeout(tick, speedRef.current);
  }, [steps]);

  const playStepSound = useCallback((idx: number, stepsArr: StackStep[]) => {
    const s = stepsArr[idx];
    if (!s) return;
    if (s.highlightColor === 'green') playInsert();
    else if (s.highlightColor === 'red') playDelete();
    else if (s.highlightColor === 'yellow') playTraverse(idx, stepsArr.length);
  }, [playInsert, playDelete, playTraverse]);
  useEffect(() => { playStepSoundRef.current = playStepSound; }, [playStepSound]);

  const displayStack = stepIndex >= 0 && steps[stepIndex] ? steps[stepIndex].stack : stack;
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;

  const addHistory = (msg: string) => setHistory((h) => [msg, ...h].slice(0, 20));

  const push = useCallback((val: number) => {
    const newItem: StackItem = { id: nextId++, value: val };
    const built: StackStep[] = [];

    setStack((prev) => {
      built.push({
        description: `Pushing ${val} onto the stack...`,
        stack: prev,
        highlightIndex: null,
        highlightColor: null,
      });
      const next = [...prev, newItem];
      built.push({
        description: `${val} placed on top of the stack. Stack size: ${next.length}`,
        stack: next,
        highlightIndex: next.length - 1,
        highlightColor: 'green',
      });
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playInsert();
      addHistory(`Push ${val}`);
      return next;
    });
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      const built: StackStep[] = [
        {
          description: `Peeking at top element: ${top.value}`,
          stack: prev,
          highlightIndex: prev.length - 1,
          highlightColor: 'yellow',
        },
        {
          description: `Popping ${top.value} from the top of the stack.`,
          stack: prev,
          highlightIndex: prev.length - 1,
          highlightColor: 'red',
        },
        {
          description: `${top.value} removed. Stack size: ${prev.length - 1}`,
          stack: prev.slice(0, -1),
          highlightIndex: null,
          highlightColor: null,
        },
      ];
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playDelete();
      addHistory(`Pop → ${top.value}`);
      return prev.slice(0, -1);
    });
  }, []);

  const peek = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      const built: StackStep[] = [
        {
          description: `Peek: reading the top element without removing it.`,
          stack: prev,
          highlightIndex: prev.length - 1,
          highlightColor: 'yellow',
        },
        {
          description: `Top element is ${top.value}.`,
          stack: prev,
          highlightIndex: prev.length - 1,
          highlightColor: 'yellow',
        },
      ];
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playAccess();
      addHistory(`Peek → ${top.value}`);
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setStack([]);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Clear stack');
  }, []);

  const generateRandom = useCallback(() => {
    const size = Math.floor(Math.random() * 5) + 3;
    const items: StackItem[] = Array.from({ length: size }, () => ({
      id: nextId++,
      value: Math.floor(Math.random() * 90) + 1,
    }));
    setStack(items);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Random stack');
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const next = Math.min(i + 1, steps.length - 1);
      playStepSound(next, steps);
      return next;
    });
  }, [steps, playStepSound]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const autoPlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    setIsPlaying(true);
    let idx = stepIndex;
    const tick = () => {
      if (idx >= steps.length - 1) { setIsPlaying(false); return; }
      idx++;
      setStepIndex(idx);
      playStepSound(idx, steps);
      timerRef.current = setTimeout(tick, speed);
    };
    timerRef.current = setTimeout(tick, speed);
  }, [isPlaying, stepIndex, steps, speed, playStepSound]);

  return {
    stack,
    displayStack,
    steps,
    stepIndex,
    currentStep,
    inputValue,
    setInputValue,
    history,
    speed,
    setSpeed,
    isPlaying,
    push,
    pop,
    peek,
    clear,
    generateRandom,
    nextStep,
    prevStep,
    autoPlay,
    soundEnabled,
    toggleSound,
    canGoNext: stepIndex < steps.length - 1,
    canGoPrev: stepIndex > 0,
  };
}
