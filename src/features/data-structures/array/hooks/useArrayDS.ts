import { useState, useCallback, useRef, useEffect } from 'react';
import { useDSSound } from '../../hooks/useDSSound';

export interface ArrayCell {
  id: number;
  value: number;
}

export type HighlightColor = 'green' | 'red' | 'yellow' | 'blue' | 'orange';

export interface ArrayStep {
  description: string;
  array: ArrayCell[];
  highlightIndices: number[];
  highlightColor: HighlightColor | null;
}

let nextId = 1;

const INITIAL_ARRAY: ArrayCell[] = [4, 2, 7, 1, 9, 3, 6].map((v) => ({
  id: nextId++,
  value: v,
}));

export function useArrayDS() {
  const [array, setArray] = useState<ArrayCell[]>(INITIAL_ARRAY);
  const [steps, setSteps] = useState<ArrayStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [indexValue, setIndexValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [speed, setSpeed] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(speed);
  const pendingAutoPlay = useRef(false);
  const { soundEnabled, toggleSound, playInsert, playDelete, playAccess, playTraverse, playFound, playNotFound } = useDSSound();
  const playStepSoundRef = useRef<(idx: number, stepsArr: ArrayStep[]) => void>(() => {});

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

  const playStepSound = useCallback((idx: number, stepsArr: ArrayStep[]) => {
    const s = stepsArr[idx];
    if (!s) return;
    if (s.highlightColor === 'green') playFound();
    else if (s.highlightColor === 'red') playDelete();
    else if (s.highlightColor === 'blue') playAccess();
    else if (s.highlightColor === 'yellow') playTraverse(idx, stepsArr.length);
    else if (s.highlightColor === 'orange') playTraverse(idx, stepsArr.length);
  }, [playFound, playDelete, playAccess, playTraverse]);
  useEffect(() => { playStepSoundRef.current = playStepSound; }, [playStepSound]);

  const displayArray = stepIndex >= 0 && steps[stepIndex] ? steps[stepIndex].array : array;
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;

  const addHistory = (msg: string) => setHistory((h) => [msg, ...h].slice(0, 20));

  const access = useCallback((idx: number) => {
    setArray((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const built: ArrayStep[] = [
        {
          description: `Access index ${idx}: going to position ${idx}...`,
          array: prev,
          highlightIndices: [],
          highlightColor: null,
        },
        {
          description: `Found value ${prev[idx].value} at index ${idx}.`,
          array: prev,
          highlightIndices: [idx],
          highlightColor: 'blue',
        },
      ];
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playAccess();
      addHistory(`Access [${idx}] → ${prev[idx].value}`);
      return prev;
    });
  }, []);

  const insertAt = useCallback((val: number, idx: number) => {
    const newCell: ArrayCell = { id: nextId++, value: val };
    setArray((prev) => {
      if (idx < 0 || idx > prev.length) return prev;
      const built: ArrayStep[] = [];

      // Show shift steps
      built.push({
        description: `Insert ${val} at index ${idx}: shifting elements right from index ${idx}...`,
        array: prev,
        highlightIndices: Array.from({ length: prev.length - idx }, (_, i) => idx + i),
        highlightColor: 'orange',
      });

      const next = [...prev.slice(0, idx), newCell, ...prev.slice(idx)];
      built.push({
        description: `${val} inserted at index ${idx}. Array size: ${next.length}`,
        array: next,
        highlightIndices: [idx],
        highlightColor: 'green',
      });

      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playInsert();
      addHistory(`Insert ${val} at [${idx}]`);
      return next;
    });
  }, []);

  const deleteAt = useCallback((idx: number) => {
    setArray((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const val = prev[idx].value;
      const built: ArrayStep[] = [
        {
          description: `Delete at index ${idx}: marking element ${val} for removal...`,
          array: prev,
          highlightIndices: [idx],
          highlightColor: 'red',
        },
        {
          description: `Shifting elements left to fill the gap...`,
          array: prev,
          highlightIndices: Array.from({ length: prev.length - idx - 1 }, (_, i) => idx + 1 + i),
          highlightColor: 'orange',
        },
      ];
      const next = prev.filter((_, i) => i !== idx);
      built.push({
        description: `${val} deleted. Array size: ${next.length}`,
        array: next,
        highlightIndices: [],
        highlightColor: null,
      });
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playDelete();
      addHistory(`Delete [${idx}] → ${val}`);
      return next;
    });
  }, []);

  const search = useCallback((val: number) => {
    setArray((prev) => {
      const built: ArrayStep[] = [];
      let foundIdx = -1;

      for (let i = 0; i < prev.length; i++) {
        built.push({
          description: `Checking index ${i}: ${prev[i].value} ${prev[i].value === val ? '== ' + val + ' ✓' : '≠ ' + val}`,
          array: prev,
          highlightIndices: [i],
          highlightColor: prev[i].value === val ? 'green' : 'yellow',
        });
        if (prev[i].value === val) {
          foundIdx = i;
          break;
        }
      }

      if (foundIdx === -1) {
        built.push({
          description: `${val} not found in the array.`,
          array: prev,
          highlightIndices: [],
          highlightColor: null,
        });
        playNotFound();
        addHistory(`Search ${val} → not found`);
      } else {
        playFound();
        addHistory(`Search ${val} → found at [${foundIdx}]`);
      }

      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      return prev;
    });
  }, []);

  const pushBack = useCallback((val: number) => {
    const newCell: ArrayCell = { id: nextId++, value: val };
    setArray((prev) => {
      const next = [...prev, newCell];
      const built: ArrayStep[] = [
        {
          description: `Appending ${val} to the end of the array...`,
          array: prev,
          highlightIndices: [],
          highlightColor: null,
        },
        {
          description: `${val} added at index ${prev.length}. Array size: ${next.length}`,
          array: next,
          highlightIndices: [next.length - 1],
          highlightColor: 'green',
        },
      ];
      setSteps(built);
      setStepIndex(0);
      pendingAutoPlay.current = true;
      playInsert();
      addHistory(`Push ${val}`);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setArray([]);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Clear array');
  }, []);

  const generateRandom = useCallback(() => {
    const size = Math.floor(Math.random() * 5) + 5;
    const items: ArrayCell[] = Array.from({ length: size }, () => ({
      id: nextId++,
      value: Math.floor(Math.random() * 90) + 1,
    }));
    setArray(items);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Random array');
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
    if (stepIndex >= steps.length - 1) return;
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
    array,
    displayArray,
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
    access,
    insertAt,
    deleteAt,
    search,
    pushBack,
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
