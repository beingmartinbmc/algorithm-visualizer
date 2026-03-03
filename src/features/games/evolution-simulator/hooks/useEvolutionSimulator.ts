import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_ALLOWED_CHARS,
  DEFAULT_CONFIG,
  RANDOM_TARGETS,
  evolveNextGeneration,
  initializeEvolution,
} from '../engine';
import type { EvolutionConfig, EvolutionState, SelectionStrategy } from '../engine';

function sanitizeTarget(value: string): string {
  const upper = value.toUpperCase();
  let out = '';
  for (let i = 0; i < upper.length; i++) {
    out += DEFAULT_ALLOWED_CHARS.includes(upper[i]) ? upper[i] : ' ';
  }
  return out;
}

export function useEvolutionSimulator() {
  const [target, setTarget] = useState(DEFAULT_CONFIG.target);
  const [populationSize, setPopulationSize] = useState(DEFAULT_CONFIG.populationSize);
  const [mutationRatePercent, setMutationRatePercent] = useState(Math.round(DEFAULT_CONFIG.mutationRate * 100));
  const [crossoverRatePercent, setCrossoverRatePercent] = useState(Math.round(DEFAULT_CONFIG.crossoverRate * 100));
  const [maxGenerations, setMaxGenerations] = useState(DEFAULT_CONFIG.maxGenerations);
  const [selectionStrategy, setSelectionStrategy] = useState<SelectionStrategy>(DEFAULT_CONFIG.selectionStrategy);
  const [speedMs, setSpeedMs] = useState(35);

  const [state, setState] = useState<EvolutionState | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef<EvolutionConfig | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const buildConfig = useCallback((): EvolutionConfig => {
    const cleanTarget = sanitizeTarget(target);
    return {
      target: cleanTarget,
      populationSize: Math.max(1, populationSize),
      mutationRate: Math.min(1, Math.max(0, mutationRatePercent / 100)),
      crossoverRate: Math.min(1, Math.max(0, crossoverRatePercent / 100)),
      maxGenerations: Math.max(1, maxGenerations),
      selectionStrategy,
      tournamentSize: 5,
      allowedChars: DEFAULT_ALLOWED_CHARS,
    };
  }, [target, populationSize, mutationRatePercent, crossoverRatePercent, maxGenerations, selectionStrategy]);

  const step = useCallback(() => {
    setState((prev) => {
      if (!prev || !configRef.current) return prev;
      const next = evolveNextGeneration(configRef.current, prev);
      if (next.done) setStatus('finished');
      return next;
    });
  }, []);

  useEffect(() => {
    if (status !== 'running') {
      clearTimer();
      return;
    }

    const loop = () => {
      step();
      timerRef.current = setTimeout(loop, speedMs);
    };

    timerRef.current = setTimeout(loop, speedMs);
    return clearTimer;
  }, [status, speedMs, step, clearTimer]);

  useEffect(() => {
    if (state?.done && status === 'running') setStatus('finished');
  }, [state, status]);

  const start = useCallback(() => {
    const cfg = buildConfig();
    configRef.current = cfg;
    const seed = 1337;
    const init = initializeEvolution(cfg, seed);
    setState(init);
    setStatus(init.done ? 'finished' : 'running');
  }, [buildConfig]);

  const pause = useCallback(() => {
    if (status === 'running') setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') setStatus('running');
  }, [status]);

  const reset = useCallback(() => {
    clearTimer();
    setState(null);
    setStatus('idle');
  }, [clearTimer]);

  const randomTarget = useCallback(() => {
    const idx = Math.floor(Math.random() * RANDOM_TARGETS.length);
    setTarget(RANDOM_TARGETS[idx]);
  }, []);

  const topIndividuals = useMemo(() => {
    if (!state?.population) return [];
    return state.population.slice(0, 10);
  }, [state]);

  const convergence = useMemo(() => {
    const tLen = Math.max(1, sanitizeTarget(target).length);
    const best = state?.bestIndividual.fitness ?? 0;
    return (best / tLen) * 100;
  }, [state, target]);

  return {
    // config
    target,
    setTarget,
    populationSize,
    setPopulationSize,
    mutationRatePercent,
    setMutationRatePercent,
    crossoverRatePercent,
    setCrossoverRatePercent,
    maxGenerations,
    setMaxGenerations,
    selectionStrategy,
    setSelectionStrategy,
    speedMs,
    setSpeedMs,

    // state
    state,
    status,
    topIndividuals,
    convergence,

    // actions
    start,
    pause,
    resume,
    reset,
    randomTarget,
  };
}
