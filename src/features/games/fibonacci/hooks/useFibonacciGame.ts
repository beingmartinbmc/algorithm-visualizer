import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameMode, PlacedSquare, DragBlock } from '../types/fibonacci';
import { nextFibValue, validatePlacement, computeScore, generateDistractors } from '../engine/fibonacci';
import { computeNextPosition, buildInitialSquares } from '../engine/spiralLayout';
import { useFibonacciSound } from './useFibonacciSound';

const MAX_SQUARES = 15;

export function useFibonacciGame() {
  const [mode, setMode] = useState<GameMode>('guided');
  const [sequence, setSequence] = useState<number[]>([1, 1]);
  const [placedSquares, setPlacedSquares] = useState<PlacedSquare[]>(() => buildInitialSquares());
  const [directionIndex, setDirectionIndex] = useState(2);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [lastPlacedId, setLastPlacedId] = useState<number | null>(null);
  const [shakeBlockId, setShakeBlockId] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playPlacementTone, playErrorTone, playCompleteSweep, playStreakTone, setEnabled } = useFibonacciSound();

  const toggleSound = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, [setEnabled]);

  const expectedNext = nextFibValue(sequence);

  const availableBlocks: DragBlock[] = (() => {
    if (isComplete) return [];
    if (mode === 'guided' || mode === 'sandbox') {
      return [{ id: 0, size: expectedNext, isCorrect: true }];
    }
    const choices = generateDistractors(expectedNext, 3);
    return choices.map((size, i) => ({
      id: i,
      size,
      isCorrect: size === expectedNext,
    }));
  })();

  useEffect(() => {
    if (mode === 'challenge' && !isComplete) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [mode, isComplete]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const placeBlock = useCallback((size: number) => {
    setLastError(null);
    setShakeBlockId(null);

    const isValid = validatePlacement(sequence, size);

    if (!isValid) {
      const expected = nextFibValue(sequence);
      setLastError(`Incorrect! Expected ${expected}`);
      setShakeBlockId(size);
      playErrorTone();
      setTimeout(() => { setShakeBlockId(null); setLastError(null); }, 1500);

      if (mode === 'challenge') {
        setScore((prev) => prev + computeScore(false, 0, 0));
        setStreak(0);
      }
      return;
    }

    const pos = computeNextPosition(placedSquares, size, directionIndex);
    const newSquare: PlacedSquare = {
      id: placedSquares.length,
      size,
      x: pos.x,
      y: pos.y,
      direction: pos.direction,
      fibIndex: sequence.length,
    };

    const newSequence = [...sequence, size];
    setSequence(newSequence);
    setPlacedSquares((prev) => [...prev, newSquare]);
    setDirectionIndex((prev) => prev + 1);
    setLastPlacedId(newSquare.id);
    playPlacementTone(newSquare.fibIndex);
    setTimeout(() => setLastPlacedId(null), 600);

    if (mode === 'challenge') {
      const timeBonus = Math.max(0, 10 - Math.floor(timer / 5));
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((prev) => prev + computeScore(true, newStreak, timeBonus));
      playStreakTone(newStreak);
    }

    if (newSequence.length >= MAX_SQUARES) {
      setIsComplete(true);
      setIsTimerRunning(false);
      playCompleteSweep();
    }
  }, [sequence, placedSquares, directionIndex, mode, streak, timer, playPlacementTone, playErrorTone, playCompleteSweep, playStreakTone]);

  const resetGame = useCallback(() => {
    setSequence([1, 1]);
    setPlacedSquares(buildInitialSquares());
    setDirectionIndex(2);
    setScore(0);
    setStreak(0);
    setTimer(0);
    setIsComplete(false);
    setLastError(null);
    setShowHint(mode === 'guided');
    setLastPlacedId(null);
    setShakeBlockId(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(mode === 'challenge');
  }, [mode]);

  const changeMode = useCallback((newMode: GameMode) => {
    setMode(newMode);
    setSequence([1, 1]);
    setPlacedSquares(buildInitialSquares());
    setDirectionIndex(2);
    setScore(0);
    setStreak(0);
    setTimer(0);
    setIsComplete(false);
    setLastError(null);
    setShowHint(newMode === 'guided');
    setLastPlacedId(null);
    setShakeBlockId(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(newMode === 'challenge');
  }, []);

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  return {
    mode,
    sequence,
    placedSquares,
    score,
    streak,
    timer,
    isComplete,
    lastError,
    showHint,
    expectedNext,
    availableBlocks,
    lastPlacedId,
    shakeBlockId,
    soundEnabled,
    changeMode,
    placeBlock,
    resetGame,
    toggleHint,
    toggleSound,
  };
}
