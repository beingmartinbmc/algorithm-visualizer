import { useCallback, useRef } from 'react';

// Pentatonic scale mapped to tile values 1–9
const TILE_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25];

export function useMahjongSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
  }, []);

  /** Tile placed — pitched by tile value */
  const playTilePlaced = useCallback((tileValue: number) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const freq = TILE_NOTES[Math.max(0, Math.min(tileValue - 1, 8))];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);

    // Soft harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    gain2.gain.setValueAtTime(0.03, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.02);
    osc2.stop(ctx.currentTime + 0.17);
  }, [getCtx]);

  /** Tile removed — short descending click */
  const playTileRemoved = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.setValueAtTime(320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }, [getCtx]);

  /** Winning hand — ascending celebratory sweep */
  const playWinSound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.2);
    });
  }, [getCtx]);

  /** Losing hand — descending three-note fall */
  const playLoseSound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const notes = [400, 340, 280];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  }, [getCtx]);

  /** Error — harsh buzz */
  const playErrorSound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, ctx.currentTime);
    osc.frequency.setValueAtTime(130, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }, [getCtx]);

  /** Solver step tick — subtle click for animation */
  const playStepTick = useCallback((index: number) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const freq = 400 + (index % 8) * 50;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, [getCtx]);

  /** Backtrack sound — quick descending blip */
  const playBacktrackSound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, ctx.currentTime);
    osc.frequency.setValueAtTime(350, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [getCtx]);

  return {
    playTilePlaced,
    playTileRemoved,
    playWinSound,
    playLoseSound,
    playErrorSound,
    playStepTick,
    playBacktrackSound,
    setEnabled,
  };
}
