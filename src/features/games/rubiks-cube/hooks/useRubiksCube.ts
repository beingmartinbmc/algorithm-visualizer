import { useState, useCallback, useRef } from 'react';
import type { CubeState, Move, SolveStep, GameMode, ChallengeResult } from '../engine/types';
import { createSolvedCube, applyMove, applyMoves, isSolved, generateScramble, cloneCube } from '../engine/cube';
import { solveCubeState } from '../engine/solver';

export interface RubiksCubeState {
  cube: CubeState;
  mode: GameMode;
  solveSteps: SolveStep[];
  currentStep: number;
  isPlaying: boolean;
  isSolved: boolean;
  scrambleMoves: Move[];
  userMoves: Move[];
  challengeResult: ChallengeResult | null;
  challengeStartTime: number | null;
  animatingMove: Move | null;
  guidedPhase: string;
  speed: number;
}

export function useRubiksCube() {
  const [state, setState] = useState<RubiksCubeState>({
    cube: createSolvedCube(),
    mode: 'free',
    solveSteps: [],
    currentStep: -1,
    isPlaying: false,
    isSolved: true,
    scrambleMoves: [],
    userMoves: [],
    challengeResult: null,
    challengeStartTime: null,
    animatingMove: null,
    guidedPhase: '',
    speed: 500,
  });

  const playIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cubeBeforeSolveRef = useRef<CubeState>(createSolvedCube());

  const reset = useCallback(() => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    setState({
      cube: createSolvedCube(),
      mode: 'free',
      solveSteps: [],
      currentStep: -1,
      isPlaying: false,
      isSolved: true,
      scrambleMoves: [],
      userMoves: [],
      challengeResult: null,
      challengeStartTime: null,
      animatingMove: null,
      guidedPhase: '',
      speed: 500,
    });
  }, []);

  const scramble = useCallback((moveCount: number = 20) => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    const moves = generateScramble(moveCount);
    const scrambled = applyMoves(createSolvedCube(), moves);
    setState(prev => ({
      ...prev,
      cube: scrambled,
      scrambleMoves: moves,
      isSolved: false,
      solveSteps: [],
      currentStep: -1,
      isPlaying: false,
      userMoves: [],
      challengeResult: null,
      animatingMove: null,
    }));
  }, []);

  const applyUserMove = useCallback((move: Move) => {
    setState(prev => {
      const newCube = applyMove(prev.cube, move);
      const solved = isSolved(newCube);

      let challengeResult = prev.challengeResult;
      if (solved && prev.mode === 'challenge' && prev.challengeStartTime) {
        const elapsed = (Date.now() - prev.challengeStartTime) / 1000;
        const optSteps = solveCubeState(applyMoves(createSolvedCube(), prev.scrambleMoves));
        challengeResult = {
          scrambleMoves: prev.scrambleMoves.length,
          userMoves: prev.userMoves.length + 1,
          optimalMoves: optSteps.length,
          timeSeconds: elapsed,
          solved: true,
        };
      }

      return {
        ...prev,
        cube: newCube,
        animatingMove: move,
        isSolved: solved,
        userMoves: [...prev.userMoves, move],
        challengeResult,
      };
    });
  }, []);

  const startSolve = useCallback(() => {
    setState(prev => {
      const steps = solveCubeState(prev.cube);
      cubeBeforeSolveRef.current = cloneCube(prev.cube);
      return {
        ...prev,
        solveSteps: steps,
        currentStep: -1,
        isPlaying: false,
        guidedPhase: steps.length > 0 ? steps[0].phase : '',
      };
    });
  }, []);

  const stepForward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep >= prev.solveSteps.length - 1) return prev;
      const nextStep = prev.currentStep + 1;
      const move = prev.solveSteps[nextStep].move;
      const newCube = applyMove(prev.cube, move);
      return {
        ...prev,
        cube: newCube,
        currentStep: nextStep,
        animatingMove: move,
        isSolved: isSolved(newCube),
        guidedPhase: prev.solveSteps[nextStep].phase,
      };
    });
  }, []);

  const stepBackward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep < 0) return prev;
      // Rebuild from scratch up to currentStep - 1
      let cube = cloneCube(cubeBeforeSolveRef.current);
      const targetStep = prev.currentStep - 1;
      for (let i = 0; i <= targetStep; i++) {
        cube = applyMove(cube, prev.solveSteps[i].move);
      }
      return {
        ...prev,
        cube,
        currentStep: targetStep,
        animatingMove: null,
        isSolved: isSolved(cube),
        guidedPhase: targetStep >= 0 ? prev.solveSteps[targetStep].phase : prev.solveSteps[0]?.phase || '',
      };
    });
  }, []);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Auto-play effect managed externally
  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.isPlaying || prev.currentStep >= prev.solveSteps.length - 1) {
        return { ...prev, isPlaying: false };
      }
      const nextStep = prev.currentStep + 1;
      const move = prev.solveSteps[nextStep].move;
      const newCube = applyMove(prev.cube, move);
      return {
        ...prev,
        cube: newCube,
        currentStep: nextStep,
        animatingMove: move,
        isSolved: isSolved(newCube),
        guidedPhase: prev.solveSteps[nextStep].phase,
      };
    });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    const solved = createSolvedCube();
    if (mode === 'challenge') {
      const moves = generateScramble(20);
      const scrambled = applyMoves(solved, moves);
      setState(prev => ({
        ...prev,
        mode,
        cube: scrambled,
        scrambleMoves: moves,
        isSolved: false,
        solveSteps: [],
        currentStep: -1,
        isPlaying: false,
        userMoves: [],
        challengeResult: null,
        challengeStartTime: Date.now(),
        animatingMove: null,
        guidedPhase: '',
      }));
    } else if (mode === 'guided') {
      const moves = generateScramble(8);
      const scrambled = applyMoves(solved, moves);
      const steps = solveCubeState(scrambled);
      cubeBeforeSolveRef.current = cloneCube(scrambled);
      setState(prev => ({
        ...prev,
        mode,
        cube: scrambled,
        scrambleMoves: moves,
        isSolved: false,
        solveSteps: steps,
        currentStep: -1,
        isPlaying: false,
        userMoves: [],
        challengeResult: null,
        challengeStartTime: null,
        animatingMove: null,
        guidedPhase: steps.length > 0 ? steps[0].phase : '',
      }));
    } else {
      setState(prev => ({
        ...prev,
        mode,
        cube: solved,
        scrambleMoves: [],
        isSolved: true,
        solveSteps: [],
        currentStep: -1,
        isPlaying: false,
        userMoves: [],
        challengeResult: null,
        challengeStartTime: null,
        animatingMove: null,
        guidedPhase: '',
      }));
    }
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const clearAnimation = useCallback(() => {
    setState(prev => ({ ...prev, animatingMove: null }));
  }, []);

  return {
    state,
    reset,
    scramble,
    applyUserMove,
    startSolve,
    stepForward,
    stepBackward,
    play,
    pause,
    tick,
    setMode,
    setSpeed,
    clearAnimation,
  };
}
