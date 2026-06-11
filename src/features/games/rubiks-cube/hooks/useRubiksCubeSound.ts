import { useCallback, useRef, useState } from 'react';

import { getAudioContext } from '@/lib/audioContext';
export function useRubiksCubeSound() {
  const enabledRef = useRef(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getCtx = useCallback((): AudioContext | null => getAudioContext(), []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.045) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
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

  const playMove = useCallback((index: number) => {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    playTone(scale[index % scale.length], 0.08, 'triangle', 0.035);
  }, [playTone]);

  const playScramble = useCallback(() => {
    playTone(196, 0.12, 'sawtooth', 0.03);
    setTimeout(() => playTone(246.94, 0.12, 'sawtooth', 0.03), 80);
  }, [playTone]);

  const playSolved = useCallback(() => {
    [392, 493.88, 587.33, 783.99].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.05), i * 75);
    });
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(164.81, 0.18, 'sawtooth', 0.035);
  }, [playTone]);

  const toggleSound = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    setSoundEnabled(enabled);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playMove,
    playScramble,
    playSolved,
    playError,
  };
}
