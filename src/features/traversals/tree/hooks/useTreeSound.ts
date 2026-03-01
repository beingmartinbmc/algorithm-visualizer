import { useCallback, useRef } from 'react';

export function useTreeSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.12) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  const playVisitTone = useCallback((nodeValue: number, totalNodes: number) => {
    const normalized = Math.min(nodeValue / Math.max(totalNodes, 1), 1);
    const freq = 200 + normalized * 600;
    playTone(freq, 0.12, 'sine', 0.08);
  }, [playTone]);

  const playProcessTone = useCallback((nodeValue: number, totalNodes: number) => {
    const normalized = Math.min(nodeValue / Math.max(totalNodes, 1), 1);
    const freq = 300 + normalized * 700;
    playTone(freq, 0.18, 'triangle', 0.12);
  }, [playTone]);

  const playCompleteSweep = useCallback((count: number) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const steps = Math.min(count, 20);
    for (let i = 0; i < steps; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 300 + (i / steps) * 800;
      g.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.1);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 0.1);
    }
  }, [getCtx]);

  return { playVisitTone, playProcessTone, playCompleteSweep, setEnabled };
}
