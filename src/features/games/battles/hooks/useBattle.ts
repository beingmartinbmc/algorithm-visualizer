import { useState, useCallback, useRef, useEffect } from 'react';
import type { SortingAlgorithmType } from '@/features/sorting/types/sorting';
import type { SortingStep } from '@/features/sorting/types/sorting';
import { runSortingAlgorithm } from '@/features/sorting/algorithms';
import type {
  BattleStatus,
  GameMode,
  InputType,
  AlgorithmState,
  BattleMetrics,
} from '../types/battle';
import { generateInput } from '../types/battle';
import { useBattleSound } from './useBattleSound';

function extractMetrics(steps: SortingStep[], upTo: number): BattleMetrics {
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  for (let i = 0; i <= upTo && i < steps.length; i++) {
    if (steps[i].comparing) {
      comparisons++;
      arrayAccesses += 2;
    }
    if (steps[i].swapping) {
      swaps++;
      arrayAccesses += 4;
    }
  }
  return {
    comparisons,
    swaps,
    arrayAccesses,
    totalOperations: comparisons + swaps,
    timeElapsed: 0,
    stepsCompleted: Math.min(upTo + 1, steps.length),
    totalSteps: steps.length,
  };
}

function buildAlgoState(alg: SortingAlgorithmType, step: SortingStep | null, metrics: BattleMetrics, idx: number, totalSteps: number, finished: boolean): AlgorithmState {
  return {
    algorithm: alg,
    metrics: { ...metrics, totalSteps },
    status: finished ? 'finished' : 'running',
    currentStepIndex: idx,
    array: step ? step.array : [],
    comparing: step ? step.comparing : null,
    swapping: step ? step.swapping : null,
    sorted: step ? step.sorted : [],
  };
}

export function useBattle() {
  const [algorithmA, setAlgorithmA] = useState<SortingAlgorithmType>('bubble');
  const [algorithmB, setAlgorithmB] = useState<SortingAlgorithmType>('merge');
  const [inputSize, setInputSize] = useState(50);
  const [inputType, setInputType] = useState<InputType>('random');
  const [gameMode, setGameMode] = useState<GameMode>('realtime');
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<BattleStatus>('setup');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [stateA, setStateA] = useState<AlgorithmState | null>(null);
  const [stateB, setStateB] = useState<AlgorithmState | null>(null);
  const [winner, setWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [prediction, setPrediction] = useState<'A' | 'B' | null>(null);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null);
  const [inputData, setInputData] = useState<number[]>([]);

  const [metricsHistory, setMetricsHistory] = useState<{ stepA: number; stepB: number; opsA: number; opsB: number }[]>([]);

  const stepsARef = useRef<SortingStep[]>([]);
  const stepsBRef = useRef<SortingStep[]>([]);
  const indexARef = useRef(0);
  const indexBRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const { playCompareTone, playSwapTone, playWinTone, setEnabled: setSoundEnabledInner } = useBattleSound();

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setSoundEnabledInner(v);
  }, [setSoundEnabledInner]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startBattle = useCallback(() => {
    const data = generateInput(inputSize, inputType);
    setInputData(data);

    const sA = runSortingAlgorithm(algorithmA, [...data]);
    const sB = runSortingAlgorithm(algorithmB, [...data]);
    stepsARef.current = sA;
    stepsBRef.current = sB;
    indexARef.current = 0;
    indexBRef.current = 0;

    const mA = extractMetrics(sA, 0);
    const mB = extractMetrics(sB, 0);

    setStateA(buildAlgoState(algorithmA, sA[0], mA, 0, sA.length, false));
    setStateB(buildAlgoState(algorithmB, sB[0], mB, 0, sB.length, false));
    setWinner(null);
    setPredictionCorrect(null);
    setMetricsHistory([{ stepA: 0, stepB: 0, opsA: 0, opsB: 0 }]);
    startTimeRef.current = performance.now();

    if (gameMode === 'turbo') {
      const finalA = extractMetrics(sA, sA.length - 1);
      const finalB = extractMetrics(sB, sB.length - 1);
      finalA.timeElapsed = 0;
      finalB.timeElapsed = 0;
      const lastA = sA[sA.length - 1];
      const lastB = sB[sB.length - 1];
      setStateA(buildAlgoState(algorithmA, lastA, finalA, sA.length - 1, sA.length, true));
      setStateB(buildAlgoState(algorithmB, lastB, finalB, sB.length - 1, sB.length, true));

      let w: 'A' | 'B' | 'tie' = 'tie';
      if (finalA.totalSteps < finalB.totalSteps) w = 'A';
      else if (finalB.totalSteps < finalA.totalSteps) w = 'B';
      setWinner(w);
      if (prediction) setPredictionCorrect(prediction === w);
      setStatus('finished');
      playWinTone();
      return;
    }

    setStatus('running');
  }, [algorithmA, algorithmB, inputSize, inputType, gameMode, prediction, playWinTone]);

  const tick = useCallback(() => {
    const sA = stepsARef.current;
    const sB = stepsBRef.current;
    let iA = indexARef.current;
    let iB = indexBRef.current;
    const doneA = iA >= sA.length - 1;
    const doneB = iB >= sB.length - 1;

    if (doneA && doneB) {
      const mA = extractMetrics(sA, iA);
      const mB = extractMetrics(sB, iB);
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      mA.timeElapsed = elapsed;
      mB.timeElapsed = elapsed;
      setStateA(buildAlgoState(algorithmA, sA[iA], mA, iA, sA.length, true));
      setStateB(buildAlgoState(algorithmB, sB[iB], mB, iB, sB.length, true));

      let w: 'A' | 'B' | 'tie' = 'tie';
      if (sA.length < sB.length) w = 'A';
      else if (sB.length < sA.length) w = 'B';
      setWinner(w);
      if (prediction) setPredictionCorrect(prediction === w);
      setStatus('finished');
      playWinTone();
      return;
    }

    if (!doneA) {
      iA++;
      indexARef.current = iA;
      const step = sA[iA];
      if (step.comparing && soundEnabled) playCompareTone(step.comparing[0], inputSize, -0.8);
      if (step.swapping && soundEnabled) playSwapTone(step.swapping[0], inputSize, -0.8);
    }
    if (!doneB) {
      iB++;
      indexBRef.current = iB;
      const step = sB[iB];
      if (step.comparing && soundEnabled) playCompareTone(step.comparing[0], inputSize, 0.8);
      if (step.swapping && soundEnabled) playSwapTone(step.swapping[0], inputSize, 0.8);
    }

    const mA = extractMetrics(sA, iA);
    const mB = extractMetrics(sB, iB);
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    mA.timeElapsed = elapsed;
    mB.timeElapsed = elapsed;

    setStateA(buildAlgoState(algorithmA, sA[iA], mA, iA, sA.length, iA >= sA.length - 1));
    setStateB(buildAlgoState(algorithmB, sB[iB], mB, iB, sB.length, iB >= sB.length - 1));

    setMetricsHistory((prev) => [
      ...prev,
      { stepA: mA.stepsCompleted, stepB: mB.stepsCompleted, opsA: mA.totalOperations, opsB: mB.totalOperations },
    ]);
  }, [algorithmA, algorithmB, inputSize, soundEnabled, prediction, playCompareTone, playSwapTone, playWinTone]);

  useEffect(() => {
    if (status !== 'running') {
      clearTimer();
      return;
    }

    let lastTime = 0;
    const loop = (time: number) => {
      if (time - lastTime >= speed) {
        lastTime = time;
        tick();
      }
      timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);

    return clearTimer;
  }, [status, speed, tick, clearTimer]);

  const pause = useCallback(() => {
    if (status === 'running') setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') setStatus('running');
  }, [status]);

  const reset = useCallback(() => {
    clearTimer();
    stepsARef.current = [];
    stepsBRef.current = [];
    indexARef.current = 0;
    indexBRef.current = 0;
    setStateA(null);
    setStateB(null);
    setWinner(null);
    setPrediction(null);
    setPredictionCorrect(null);
    setMetricsHistory([]);
    setStatus('setup');
  }, [clearTimer]);

  return {
    algorithmA, setAlgorithmA,
    algorithmB, setAlgorithmB,
    inputSize, setInputSize,
    inputType, setInputType,
    gameMode, setGameMode,
    speed, setSpeed,
    status,
    soundEnabled, toggleSound,
    stateA, stateB,
    winner,
    prediction, setPrediction,
    predictionCorrect,
    inputData,
    metricsHistory,
    startBattle,
    pause,
    resume,
    reset,
  };
}
