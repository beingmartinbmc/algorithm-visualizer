import { useRef, useCallback } from 'react';
import type { VisualizationSpeed } from '@/types/graph';

const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

const NOTE_DURATION: Record<VisualizationSpeed, number> = {
  slow: 0.18,
  medium: 0.1,
  fast: 0.05,
  instant: 0,
};

const VOLUME: Record<VisualizationSpeed, number> = {
  slow: 0.08,
  medium: 0.06,
  fast: 0.04,
  instant: 0,
};

export function useSound() {
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

  const playVisitedTone = useCallback(
    (row: number, col: number, totalRows: number, totalCols: number, speed: VisualizationSpeed) => {
      if (!enabledRef.current || speed === 'instant') return;

      const ctx = getContext();
      const duration = NOTE_DURATION[speed];
      const volume = VOLUME[speed];

      const normalizedPos = (row * totalCols + col) / (totalRows * totalCols);
      const scaleIndex = Math.floor(normalizedPos * (PENTATONIC_SCALE.length - 1));
      const freq = PENTATONIC_SCALE[Math.min(scaleIndex, PENTATONIC_SCALE.length - 1)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getContext]
  );

  const playPathTone = useCallback(
    (index: number, totalPath: number, speed: VisualizationSpeed) => {
      if (!enabledRef.current || speed === 'instant') return;

      const ctx = getContext();
      const duration = NOTE_DURATION[speed] * 3;
      const volume = VOLUME[speed] * 1.5;

      const normalizedPos = index / Math.max(totalPath - 1, 1);
      const freq = 440 + normalizedPos * 440;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getContext]
  );

  const playCompleteTone = useCallback(
    (found: boolean) => {
      if (!enabledRef.current) return;

      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      if (found) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    },
    [getContext]
  );

  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    playVisitedTone,
    playPathTone,
    playCompleteTone,
    setEnabled,
    isEnabled,
  };
}
