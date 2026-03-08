import { useCallback, useRef } from 'react';

// Frequencies mapped to each face for distinct tones
const FACE_FREQ: Record<string, number> = {
  U: 523.25, // C5
  D: 392.00, // G4
  F: 440.00, // A4
  B: 349.23, // F4
  L: 329.63, // E4
  R: 493.88, // B4
};

export function useRubiksSound() {
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

  const isEnabled = useCallback(() => enabledRef.current, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume = 0.06) => {
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

  // Play a move sound — pitch varies by face
  const playMove = useCallback((move: string) => {
    const face = move[0];
    const freq = FACE_FREQ[face] || 440;
    const mod = move.slice(1);
    // CW = normal, CCW = slightly lower, 180 = slightly higher
    const offset = mod === "'" ? -30 : mod === '2' ? 40 : 0;
    playTone(freq + offset, 'triangle', 0.1, 0.06);
  }, [playTone]);

  // Play scramble tick — quick subtle click
  const playScrambleTick = useCallback(() => {
    playTone(800, 'square', 0.03, 0.02);
  }, [playTone]);

  // Play when cube is solved — ascending chord
  const playSolved = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }, [getCtx]);

  // Play step forward sound
  const playStep = useCallback(() => {
    playTone(600, 'sine', 0.06, 0.04);
  }, [playTone]);

  return { setEnabled, isEnabled, playMove, playScrambleTick, playSolved, playStep };
}
