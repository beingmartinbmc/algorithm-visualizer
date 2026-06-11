import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildLinkedListSteps } from '../algorithms/linkedListAlgorithms';
import { PROBLEM_INFO, type LLProblem, type LLStep } from '../types/linkedListAlgo';
import { useAlgorithmSound } from '../../hooks/useAlgorithmSound';

/**
 * Drives forward / backward / auto-play through the pre-computed step array
 * for a given linked-list problem. Speed is in milliseconds-per-step and the
 * playback loop reads it live from a ref so the slider takes effect instantly.
 */
export function useLinkedListAlgo(problem: LLProblem) {
  const info = PROBLEM_INFO[problem];
  const [input, setInput] = useState(info.defaultInput);
  const [steps, setSteps] = useState<LLStep[]>(() => buildLinkedListSteps(problem, info.defaultInput));
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700); // ms per step

  const speedRef = useRef(speed);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepsRef = useRef(steps);
  const { soundEnabled, toggleSound, playEvent } = useAlgorithmSound();
  const playEventRef = useRef(playEvent);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { playEventRef.current = playEvent; }, [playEvent]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const currentStep = steps[stepIndex] ?? steps[0] ?? null;
  const progress = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  const stop = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const goToStep = useCallback((nextIndex: number, withSound = true) => {
    const list = stepsRef.current;
    const clamped = Math.max(0, Math.min(list.length - 1, nextIndex));
    setStepIndex(clamped);
    if (withSound) {
      const step = list[clamped];
      if (step) playEventRef.current(step.event, clamped, list.length);
    }
  }, []);

  const play = useCallback(() => {
    const list = stepsRef.current;
    if (list.length === 0) return;
    // Restart from the beginning if we're already at the end.
    let idx = stepIndex >= list.length - 1 ? 0 : stepIndex;
    setStepIndex(idx);
    setIsPlaying(true);

    const tick = () => {
      if (idx >= list.length - 1) { setIsPlaying(false); clearTimer(); return; }
      idx += 1;
      setStepIndex(idx);
      const step = list[idx];
      if (step) playEventRef.current(step.event, idx, list.length);
      timerRef.current = setTimeout(tick, speedRef.current);
    };
    // play the current frame's sound, then schedule the next.
    const firstStep = list[idx];
    if (firstStep) playEventRef.current(firstStep.event, idx, list.length);
    timerRef.current = setTimeout(tick, speedRef.current);
  }, [stepIndex, clearTimer]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stop();
    else play();
  }, [isPlaying, play, stop]);

  const next = useCallback(() => { stop(); goToStep(stepIndex + 1); }, [stop, goToStep, stepIndex]);
  const prev = useCallback(() => { stop(); goToStep(stepIndex - 1); }, [stop, goToStep, stepIndex]);
  const reset = useCallback(() => { stop(); goToStep(0, false); }, [stop, goToStep]);

  const run = useCallback((rawInput?: string) => {
    stop();
    const value = rawInput ?? input;
    const built = buildLinkedListSteps(problem, value);
    setSteps(built);
    stepsRef.current = built;
    setStepIndex(0);
    if (built[0]) playEventRef.current(built[0].event, 0, built.length);
  }, [input, problem, stop]);

  const maxNodes = useMemo(() => steps.reduce((m, s) => Math.max(m, s.nodes.length), 0), [steps]);

  return {
    info,
    input,
    setInput,
    steps,
    stepIndex,
    currentStep,
    progress,
    isPlaying,
    speed,
    setSpeed,
    soundEnabled,
    toggleSound,
    maxNodes,
    run,
    togglePlay,
    next,
    prev,
    reset,
    goToStep: (i: number) => { stop(); goToStep(i); },
    canGoNext: stepIndex < steps.length - 1,
    canGoPrev: stepIndex > 0,
  };
}

export type LinkedListAlgoHook = ReturnType<typeof useLinkedListAlgo>;
