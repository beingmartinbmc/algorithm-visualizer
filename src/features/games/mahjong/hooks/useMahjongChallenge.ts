import { useState, useCallback, useRef, useEffect } from 'react';
import type { TileCode, ChallengeState, WinResult } from '../types/mahjong';
import { generateRandomHand, generateWinningHand } from '../engine/tileManager';
import { solve } from '../engine/solver';
import { useMahjongSound } from './useMahjongSound';

function generateChallengeHand(): { hand: TileCode[]; isWinning: boolean; solution: WinResult | null } {
  // ~50% chance of winning hand
  if (Math.random() < 0.5) {
    const hand = generateWinningHand();
    const result = solve(hand);
    return { hand, isWinning: result.isWin, solution: result.isWin ? result : null };
  }
  // Generate random hands until we get a non-winner (almost always first try)
  for (let i = 0; i < 50; i++) {
    const hand = generateRandomHand();
    const result = solve(hand);
    if (!result.isWin) return { hand, isWinning: false, solution: null };
  }
  // Fallback known non-winner
  const hand = generateRandomHand();
  return { hand, isWinning: false, solution: null };
}

const INITIAL_STATE: ChallengeState = {
  hand: [],
  isWinning: false,
  solution: null,
  round: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  timer: 0,
  answered: false,
  lastCorrect: null,
  totalCorrect: 0,
  totalAnswered: 0,
};

export function useMahjongChallenge() {
  const [state, setState] = useState<ChallengeState>(INITIAL_STATE);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sound = useMahjongSound();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer tick
  useEffect(() => {
    if (isRunning && !state.answered) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, state.answered]);

  const startGame = useCallback(() => {
    const { hand, isWinning, solution } = generateChallengeHand();
    setState({
      ...INITIAL_STATE,
      hand,
      isWinning,
      solution,
      round: 1,
    });
    setIsRunning(true);
  }, []);

  const nextRound = useCallback(() => {
    const { hand, isWinning, solution } = generateChallengeHand();
    setState((prev) => ({
      ...prev,
      hand,
      isWinning,
      solution,
      round: prev.round + 1,
      timer: 0,
      answered: false,
      lastCorrect: null,
    }));
  }, []);

  const answer = useCallback((playerSaysWin: boolean) => {
    if (state.answered) return;
    const correct = playerSaysWin === state.isWinning;
    const timeBonus = Math.max(0, 10 - state.timer);
    const points = correct ? 100 + timeBonus * 10 + state.streak * 25 : 0;

    if (correct) {
      sound.playWinSound();
    } else {
      sound.playLoseSound();
    }

    setState((prev) => ({
      ...prev,
      answered: true,
      lastCorrect: correct,
      score: prev.score + points,
      streak: correct ? prev.streak + 1 : 0,
      bestStreak: correct ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      totalAnswered: prev.totalAnswered + 1,
    }));
  }, [state.answered, state.isWinning, state.timer, state.streak, sound]);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    sound.setEnabled(v);
  }, [sound]);

  return {
    ...state,
    isRunning,
    soundEnabled,
    startGame,
    nextRound,
    answer,
    resetGame,
    toggleSound,
  };
}
