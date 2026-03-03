import { useRef, useCallback, useState } from 'react';

export function useDSSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, volume = 0.06) => {
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
    },
    [getCtx]
  );

  // Insert / push / enqueue — bright ascending ping
  const playInsert = useCallback(() => {
    playTone(523.25, 'sine', 0.14);
  }, [playTone]);

  // Delete / pop / dequeue — lower muted tone
  const playDelete = useCallback(() => {
    playTone(293.66, 'triangle', 0.14);
  }, [playTone]);

  // Access / peek — short high ping
  const playAccess = useCallback(() => {
    playTone(659.25, 'sine', 0.09, 0.04);
  }, [playTone]);

  // Traversal step — pitch rises with position (index / total)
  const playTraverse = useCallback(
    (index: number, total: number) => {
      const freq = 220 + (index / Math.max(total - 1, 1)) * 440;
      playTone(freq, 'sine', 0.07, 0.035);
    },
    [playTone]
  );

  // Found / success — short ascending arpeggio
  const playFound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }, [getCtx]);

  // Not found — descending buzz
  const playNotFound = useCallback(() => {
    playTone(220, 'sawtooth', 0.18, 0.045);
  }, [playTone]);

  const toggleSound = useCallback((val: boolean) => {
    enabledRef.current = val;
    setSoundEnabled(val);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playInsert,
    playDelete,
    playAccess,
    playTraverse,
    playFound,
    playNotFound,
  };
}
