import { useState, useCallback, useRef, useEffect } from 'react';
import type { TileCode, SolveResult, SolverStep } from '../types/mahjong';
import { HAND_SIZE } from '../types/mahjong';
import { sortHand, canAddTile, validateHand, generateRandomHand, generateWinningHand, parseTile } from '../engine/tileManager';
import { solve, solveWithSteps } from '../engine/solver';
import { useMahjongSound } from './useMahjongSound';

export function useMahjong() {
  const [hand, setHand] = useState<TileCode[]>([]);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [steps, setSteps] = useState<SolverStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(400);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sound = useMahjongSound();

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setSteps([]);
    setStepIndex(-1);
    setIsAnimating(false);
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
  }, []);

  const addTile = useCallback((tile: TileCode) => {
    setHand((prev) => {
      const err = canAddTile(prev, tile);
      if (err) {
        setLastError(err);
        sound.playErrorSound();
        return prev;
      }
      setLastError(null);
      clearResult();
      sound.playTilePlaced(parseTile(tile).value);
      return sortHand([...prev, tile]);
    });
  }, [clearResult, sound]);

  const removeTile = useCallback((index: number) => {
    setHand((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      clearResult();
      sound.playTileRemoved();
      return next;
    });
    setLastError(null);
  }, [clearResult, sound]);

  const resetHand = useCallback(() => {
    setHand([]);
    setLastError(null);
    clearResult();
  }, [clearResult]);

  const randomHand = useCallback(() => {
    setHand(generateRandomHand());
    setLastError(null);
    clearResult();
  }, [clearResult]);

  const winningHand = useCallback(() => {
    setHand(generateWinningHand());
    setLastError(null);
    clearResult();
  }, [clearResult]);

  const checkHand = useCallback(() => {
    const err = validateHand(hand);
    if (err) {
      setLastError(err);
      sound.playErrorSound();
      return;
    }
    setLastError(null);

    if (showAnimation) {
      const { result: r, steps: s } = solveWithSteps(hand);
      setResult(r);
      setSteps(s);
      setStepIndex(-1);
    } else {
      const r = solve(hand);
      setResult(r);
      setSteps([]);
      setStepIndex(-1);
      if (r.isWin) {
        sound.playWinSound();
      } else {
        sound.playLoseSound();
      }
    }
  }, [hand, showAnimation, sound]);

  // ── Animation controls ──────────────────────────────────────────────────

  const stepForward = useCallback(() => {
    setStepIndex((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      if (next >= 0 && next < steps.length) {
        const step = steps[next];
        if (step.action.type === 'backtrack' || step.action.type === 'pair_failed') {
          sound.playBacktrackSound();
        } else if (step.action.type === 'found_win') {
          sound.playWinSound();
        } else if (step.action.type === 'no_win') {
          sound.playLoseSound();
        } else {
          sound.playStepTick(next);
        }
      }
      return next;
    });
  }, [steps, sound]);

  const stepBack = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, -1));
  }, []);

  const autoPlay = useCallback(() => {
    if (isAnimating) {
      // Pause
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setStepIndex((prev) => (prev >= steps.length - 1 ? -1 : prev));

    animRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          if (animRef.current) clearInterval(animRef.current);
          animRef.current = null;
          setIsAnimating(false);
          return prev;
        }
        const next = prev + 1;
        if (next < steps.length) {
          const step = steps[next];
          if (step.action.type === 'backtrack' || step.action.type === 'pair_failed') {
            sound.playBacktrackSound();
          } else if (step.action.type === 'found_win') {
            sound.playWinSound();
          } else if (step.action.type === 'no_win') {
            sound.playLoseSound();
          } else {
            sound.playStepTick(next);
          }
        }
        return next;
      });
    }, animSpeed);
  }, [isAnimating, steps, animSpeed, sound]);

  const toggleAnimation = useCallback(() => {
    setShowAnimation((p) => !p);
    clearResult();
  }, [clearResult]);

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    sound.setEnabled(v);
  }, [sound]);

  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

  return {
    hand,
    result,
    steps,
    stepIndex,
    stepsTotal: steps.length,
    currentStep,
    isAnimating,
    animSpeed,
    showAnimation,
    lastError,
    handIsFull: hand.length >= HAND_SIZE,
    soundEnabled,
    addTile,
    removeTile,
    resetHand,
    randomHand,
    winningHand,
    checkHand,
    stepForward,
    stepBack,
    autoPlay,
    setAnimSpeed,
    toggleAnimation,
    toggleSound,
  };
}
