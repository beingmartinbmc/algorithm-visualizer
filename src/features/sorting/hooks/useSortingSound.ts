import { useRef, useCallback } from 'react';
import type { VisualizationSpeed } from '../types/sorting';

const NOTE_DURATION: Record<VisualizationSpeed, number> = {
  slow: 0.15,
  medium: 0.08,
  fast: 0.04,
  instant: 0,
};

const VOLUME: Record<VisualizationSpeed, number> = {
  slow: 0.07,
  medium: 0.05,
  fast: 0.035,
  instant: 0,
};

export function useSortingSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (value: number, maxValue: number, speed: VisualizationSpeed, type: 'compare' | 'swap' | 'sorted') => {
      if (!enabledRef.current || speed === 'instant') return;

      const ctx = getContext();
      const duration = NOTE_DURATION[speed];
      const volume = VOLUME[speed];

      const normalized = value / maxValue;
      const minFreq = 200;
      const maxFreq = 800;
      const freq = minFreq + normalized * (maxFreq - minFreq);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'compare') {
        osc.type = 'sine';
      } else if (type === 'swap') {
        osc.type = 'triangle';
      } else {
        osc.type = 'sine';
      }

      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const vol = type === 'sorted' ? volume * 1.5 : volume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getContext]
  );

  const playCompleteSweep = useCallback(
    (arrayLength: number) => {
      if (!enabledRef.current) return;

      const ctx = getContext();
      const minFreq = 200;
      const maxFreq = 800;

      for (let i = 0; i < arrayLength; i++) {
        const freq = minFreq + (i / arrayLength) * (maxFreq - minFreq);
        const startTime = ctx.currentTime + i * 0.02;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.06);
      }
    },
    [getContext]
  );

  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
  }, []);

  return {
    playTone,
    playCompleteSweep,
    setEnabled,
  };
}
