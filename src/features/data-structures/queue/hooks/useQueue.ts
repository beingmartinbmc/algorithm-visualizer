import { useState, useCallback, useRef } from 'react';

export interface QueueItem {
  id: number;
  value: number;
}

export interface QueueStep {
  description: string;
  queue: QueueItem[];
  highlightIndex: number | null;
  highlightColor: 'green' | 'red' | 'yellow' | null;
}

let nextId = 1;

const INITIAL_QUEUE: QueueItem[] = [
  { id: nextId++, value: 5 },
  { id: nextId++, value: 12 },
  { id: nextId++, value: 8 },
];

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [steps, setSteps] = useState<QueueStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [speed, setSpeed] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayQueue = stepIndex >= 0 && steps[stepIndex] ? steps[stepIndex].queue : queue;
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;

  const addHistory = (msg: string) => setHistory((h) => [msg, ...h].slice(0, 20));

  const enqueue = useCallback((val: number) => {
    const newItem: QueueItem = { id: nextId++, value: val };
    setQueue((prev) => {
      const next = [...prev, newItem];
      const built: QueueStep[] = [
        {
          description: `Enqueuing ${val} at the rear of the queue...`,
          queue: prev,
          highlightIndex: null,
          highlightColor: null,
        },
        {
          description: `${val} added to the rear. Queue size: ${next.length}`,
          queue: next,
          highlightIndex: next.length - 1,
          highlightColor: 'green',
        },
      ];
      setSteps(built);
      setStepIndex(1);
      addHistory(`Enqueue ${val}`);
      return next;
    });
  }, []);

  const dequeue = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const front = prev[0];
      const built: QueueStep[] = [
        {
          description: `Dequeue: checking front element ${front.value}...`,
          queue: prev,
          highlightIndex: 0,
          highlightColor: 'yellow',
        },
        {
          description: `Removing ${front.value} from the front.`,
          queue: prev,
          highlightIndex: 0,
          highlightColor: 'red',
        },
        {
          description: `${front.value} removed. Queue size: ${prev.length - 1}`,
          queue: prev.slice(1),
          highlightIndex: null,
          highlightColor: null,
        },
      ];
      setSteps(built);
      setStepIndex(2);
      addHistory(`Dequeue → ${front.value}`);
      return prev.slice(1);
    });
  }, []);

  const peekFront = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const front = prev[0];
      const built: QueueStep[] = [
        {
          description: `Peek front: reading without removing.`,
          queue: prev,
          highlightIndex: 0,
          highlightColor: 'yellow',
        },
        {
          description: `Front element is ${front.value}.`,
          queue: prev,
          highlightIndex: 0,
          highlightColor: 'yellow',
        },
      ];
      setSteps(built);
      setStepIndex(1);
      addHistory(`Peek → ${front.value}`);
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Clear queue');
  }, []);

  const generateRandom = useCallback(() => {
    const size = Math.floor(Math.random() * 4) + 3;
    const items: QueueItem[] = Array.from({ length: size }, () => ({
      id: nextId++,
      value: Math.floor(Math.random() * 90) + 1,
    }));
    setQueue(items);
    setSteps([]);
    setStepIndex(-1);
    addHistory('Random queue');
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
    queue,
    displayQueue,
    steps,
    stepIndex,
    currentStep,
    inputValue,
    setInputValue,
    history,
    speed,
    setSpeed,
    isPlaying,
    enqueue,
    dequeue,
    peekFront,
    clear,
    generateRandom,
    nextStep,
    prevStep,
    autoPlay,
    canGoNext: stepIndex < steps.length - 1,
    canGoPrev: stepIndex > 0,
  };
}
