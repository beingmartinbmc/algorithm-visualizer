import { useState, useCallback, useRef, useEffect } from 'react';
import type { GridMatrix } from '@/features/traversals/graph/types/graph';
import type { PathAlgorithm, PathfindingStep, MazeType } from '../engine/pathfindingEngine';
import { createBattleGrid, runPathfindingBattle } from '../engine/pathfindingEngine';
import type { GameMode } from '../types/battle';
import { useBattleSound } from './useBattleSound';

export interface PathfindingAlgoState {
  algorithm: PathAlgorithm;
  steps: PathfindingStep[];
  currentIndex: number;
  totalVisited: number;
  pathLength: number;
  found: boolean;
  finished: boolean;
}

export function usePathfindingBattle() {
  const [algorithmA, setAlgorithmA] = useState<PathAlgorithm>('bfs');
  const [algorithmB, setAlgorithmB] = useState<PathAlgorithm>('dfs');
  const [mazeType, setMazeType] = useState<MazeType>('random');
  const [gameMode, setGameMode] = useState<GameMode>('realtime');
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'setup' | 'running' | 'paused' | 'finished'>('setup');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [grid, setGrid] = useState<GridMatrix | null>(null);
  const [stateA, setStateA] = useState<PathfindingAlgoState | null>(null);
  const [stateB, setStateB] = useState<PathfindingAlgoState | null>(null);
  const [winner, setWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [prediction, setPrediction] = useState<'A' | 'B' | null>(null);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null);

  const stepsARef = useRef<PathfindingStep[]>([]);
  const stepsBRef = useRef<PathfindingStep[]>([]);
  const indexARef = useRef(0);
  const indexBRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const resultARef = useRef<{ totalVisited: number; pathLength: number; found: boolean }>({ totalVisited: 0, pathLength: 0, found: false });
  const resultBRef = useRef<{ totalVisited: number; pathLength: number; found: boolean }>({ totalVisited: 0, pathLength: 0, found: false });

  const { playCompareTone, playWinTone, setEnabled } = useBattleSound();

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setEnabled(v);
  }, [setEnabled]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const determineWinner = useCallback((resA: typeof resultARef.current, resB: typeof resultBRef.current) => {
    let w: 'A' | 'B' | 'tie' = 'tie';
    if (resA.found && !resB.found) w = 'A';
    else if (!resA.found && resB.found) w = 'B';
    else if (resA.found && resB.found) {
      if (resA.totalVisited < resB.totalVisited) w = 'A';
      else if (resB.totalVisited < resA.totalVisited) w = 'B';
    }
    return w;
  }, []);

  const startBattle = useCallback(() => {
    const { grid: g, start, end } = createBattleGrid(mazeType);
    setGrid(g);

    const resA = runPathfindingBattle(g, start, end, algorithmA);
    const resB = runPathfindingBattle(g, start, end, algorithmB);
    stepsARef.current = resA.steps;
    stepsBRef.current = resB.steps;
    indexARef.current = 0;
    indexBRef.current = 0;
    resultARef.current = { totalVisited: resA.totalVisited, pathLength: resA.pathLength, found: resA.found };
    resultBRef.current = { totalVisited: resB.totalVisited, pathLength: resB.pathLength, found: resB.found };

    const initA: PathfindingAlgoState = {
      algorithm: algorithmA,
      steps: resA.steps,
      currentIndex: 0,
      totalVisited: resA.totalVisited,
      pathLength: resA.pathLength,
      found: resA.found,
      finished: false,
    };
    const initB: PathfindingAlgoState = {
      algorithm: algorithmB,
      steps: resB.steps,
      currentIndex: 0,
      totalVisited: resB.totalVisited,
      pathLength: resB.pathLength,
      found: resB.found,
      finished: false,
    };

    if (gameMode === 'turbo') {
      setStateA({ ...initA, currentIndex: resA.steps.length - 1, finished: true });
      setStateB({ ...initB, currentIndex: resB.steps.length - 1, finished: true });
      const w = determineWinner(resultARef.current, resultBRef.current);
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
  }, [algorithmA, algorithmB, mazeType, gameMode, prediction, determineWinner, playWinTone]);

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
      const w = determineWinner(resultARef.current, resultBRef.current);
      setWinner(w);
      if (prediction) setPredictionCorrect(prediction === w);
      setStatus('finished');
      playWinTone();
      return;
    }

    if (!doneA) {
      iA++;
      indexARef.current = iA;
      if (soundEnabled) playCompareTone(iA, sA.length, -0.8);
    }
    if (!doneB) {
      iB++;
      indexBRef.current = iB;
      if (soundEnabled) playCompareTone(iB, sB.length, 0.8);
    }

    setStateA((prev) => prev ? { ...prev, currentIndex: iA, finished: iA >= sA.length - 1 } : null);
    setStateB((prev) => prev ? { ...prev, currentIndex: iB, finished: iB >= sB.length - 1 } : null);
  }, [soundEnabled, prediction, determineWinner, playCompareTone, playWinTone]);

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

  const pause = useCallback(() => { if (status === 'running') setStatus('paused'); }, [status]);
  const resume = useCallback(() => { if (status === 'paused') setStatus('running'); }, [status]);
  const reset = useCallback(() => {
    clearTimer();
    setGrid(null);
    setStateA(null);
    setStateB(null);
    setWinner(null);
    setPrediction(null);
    setPredictionCorrect(null);
    setStatus('setup');
  }, [clearTimer]);

  return {
    algorithmA, setAlgorithmA,
    algorithmB, setAlgorithmB,
    mazeType, setMazeType,
    gameMode, setGameMode,
    speed, setSpeed,
    status,
    soundEnabled, toggleSound,
    grid,
    stateA, stateB,
    winner,
    prediction, setPrediction,
    predictionCorrect,
    startBattle, pause, resume, reset,
  };
}
