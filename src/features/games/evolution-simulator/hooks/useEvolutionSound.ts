import { useCallback, useRef } from 'react';

const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];

export function useEvolutionSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume = 0.05) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  const playGenerationTick = useCallback((fitness: number, targetLength: number) => {
    const norm = targetLength > 0 ? fitness / targetLength : 0;
    const idx = Math.max(0, Math.min(SCALE.length - 1, Math.floor(norm * (SCALE.length - 1))));
    playTone(SCALE[idx], 'sine', 0.06, 0.03);
  }, [playTone]);

  const playImprove = useCallback(() => {
    playTone(523.25, 'triangle', 0.08, 0.05);
  }, [playTone]);

  const playComplete = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }, [getCtx]);

  return { setEnabled, playGenerationTick, playImprove, playComplete };
}
