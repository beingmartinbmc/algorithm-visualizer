import { useState, useCallback, useRef, useEffect } from 'react';
import type { RecursionAlgorithm, RecursionStep, RecursionProblem } from '../engine/recursionEngine';
import { runRecursionAlgorithm, PROBLEM_OPTIONS } from '../engine/recursionEngine';
import type { GameMode } from '../types/battle';
import { useBattleSound } from './useBattleSound';

export interface RecursionAlgoState {
  algorithm: RecursionAlgorithm;
  steps: RecursionStep[];
  currentIndex: number;
  totalCalls: number;
  totalCacheHits: number;
  maxDepth: number;
  finalResult: number;
  finished: boolean;
}

export function useRecursionBattle() {
  const [algorithmA, setAlgorithmA] = useState<RecursionAlgorithm>('naive');
  const [algorithmB, setAlgorithmB] = useState<RecursionAlgorithm>('memoized');
  const [problem, setProblem] = useState<RecursionProblem>('fibonacci');
  const [inputN, setInputN] = useState(15);

  const changeProblem = useCallback((p: RecursionProblem) => {
    setProblem(p);
    const opt = PROBLEM_OPTIONS.find((o) => o.value === p);
    if (opt) setInputN(opt.defaultN);
  }, []);
  const [gameMode, setGameMode] = useState<GameMode>('realtime');
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'setup' | 'running' | 'paused' | 'finished'>('setup');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stateA, setStateA] = useState<RecursionAlgoState | null>(null);
  const [stateB, setStateB] = useState<RecursionAlgoState | null>(null);
  const [winner, setWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [prediction, setPrediction] = useState<'A' | 'B' | null>(null);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null);

  const stepsARef = useRef<RecursionStep[]>([]);
  const stepsBRef = useRef<RecursionStep[]>([]);
  const indexARef = useRef(0);
  const indexBRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const { playCompareTone, playWinTone, setEnabled } = useBattleSound();

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setEnabled(v);
  }, [setEnabled]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { cancelAnimationFrame(timerRef.current); timerRef.current = null; }
  }, []);

  const startBattle = useCallback(() => {
    const resA = runRecursionAlgorithm(algorithmA, inputN, problem);
    const resB = runRecursionAlgorithm(algorithmB, inputN, problem);
    stepsARef.current = resA.steps;
    stepsBRef.current = resB.steps;
    indexARef.current = 0;
    indexBRef.current = 0;

    const initA: RecursionAlgoState = {
      algorithm: algorithmA, steps: resA.steps, currentIndex: 0,
      totalCalls: resA.totalCalls, totalCacheHits: resA.totalCacheHits,
      maxDepth: resA.maxDepth, finalResult: resA.finalResult, finished: false,
    };
    const initB: RecursionAlgoState = {
      algorithm: algorithmB, steps: resB.steps, currentIndex: 0,
      totalCalls: resB.totalCalls, totalCacheHits: resB.totalCacheHits,
      maxDepth: resB.maxDepth, finalResult: resB.finalResult, finished: false,
    };

    if (gameMode === 'turbo') {
      setStateA({ ...initA, currentIndex: resA.steps.length - 1, finished: true });
      setStateB({ ...initB, currentIndex: resB.steps.length - 1, finished: true });
      let w: 'A' | 'B' | 'tie' = 'tie';
      if (resA.totalCalls < resB.totalCalls) w = 'A';
      else if (resB.totalCalls < resA.totalCalls) w = 'B';
      setWinner(w);
      if (prediction) setPredictionCorrect(prediction === w);
      setStatus('finished');
      playWinTone();
      return;
    }

    setStateA(initA);
    setStateB(initB);
    setWinner(null);
    setPredictionCorrect(null);
    setStatus('running');
  }, [algorithmA, algorithmB, inputN, problem, gameMode, prediction, playWinTone]);

  const tick = useCallback(() => {
    let iA = indexARef.current;
    let iB = indexBRef.current;
    const sA = stepsARef.current;
    const sB = stepsBRef.current;
    const doneA = iA >= sA.length - 1;
    const doneB = iB >= sB.length - 1;

    if (doneA && doneB) {
      setStateA((prev) => prev ? { ...prev, currentIndex: iA, finished: true } : null);
      setStateB((prev) => prev ? { ...prev, currentIndex: iB, finished: true } : null);
      let w: 'A' | 'B' | 'tie' = 'tie';
      if (sA.length < sB.length) w = 'A';
      else if (sB.length < sA.length) w = 'B';
      setWinner(w);
      if (prediction) setPredictionCorrect(prediction === w);
      setStatus('finished');
      playWinTone();
      return;
    }

    if (!doneA) { iA++; indexARef.current = iA; if (soundEnabled) playCompareTone(iA % 20, 20, -0.8); }
    if (!doneB) { iB++; indexBRef.current = iB; if (soundEnabled) playCompareTone(iB % 20, 20, 0.8); }

    setStateA((prev) => prev ? { ...prev, currentIndex: iA, finished: iA >= sA.length - 1 } : null);
    setStateB((prev) => prev ? { ...prev, currentIndex: iB, finished: iB >= sB.length - 1 } : null);
  }, [soundEnabled, prediction, playCompareTone, playWinTone]);

  useEffect(() => {
    if (status !== 'running') { clearTimer(); return; }
    let lastTime = 0;
    const loop = (time: number) => {
      if (time - lastTime >= speed) { lastTime = time; tick(); }
      timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);
    return clearTimer;
  }, [status, speed, tick, clearTimer]);

  const pause = useCallback(() => { if (status === 'running') setStatus('paused'); }, [status]);
  const resume = useCallback(() => { if (status === 'paused') setStatus('running'); }, [status]);
  const reset = useCallback(() => {
    clearTimer();
    setStateA(null); setStateB(null);
    setWinner(null); setPrediction(null); setPredictionCorrect(null);
    setStatus('setup');
  }, [clearTimer]);

  return {
    algorithmA, setAlgorithmA,
    algorithmB, setAlgorithmB,
    problem, changeProblem,
    inputN, setInputN,
    gameMode, setGameMode,
    speed, setSpeed,
    status, soundEnabled, toggleSound,
    stateA, stateB, winner,
    prediction, setPrediction, predictionCorrect,
    startBattle, pause, resume, reset,
  };
}
