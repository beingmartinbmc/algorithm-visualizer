import { useCallback, useRef, useState } from 'react';

import { getAudioContext } from '@/lib/audioContext';
type SoundEvent = 'compare' | 'swap' | 'visit' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'recurse' | 'found' | 'not-found' | 'complete';

const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 659.25, 783.99];

export function useAlgorithmSound() {
  const enabledRef = useRef(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getCtx = useCallback((): AudioContext | null => getAudioContext(), []);

  const playTone = useCallback((freq: number, duration = 0.08, type: OscillatorType = 'sine', volume = 0.04) => {
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

  const playEvent = useCallback((event: SoundEvent, index = 0, total = 1) => {
    const scaled = SCALE[Math.max(0, Math.min(SCALE.length - 1, Math.floor((index / Math.max(total - 1, 1)) * (SCALE.length - 1))))];
    switch (event) {
      case 'compare':
        playTone(scaled, 0.055, 'sine', 0.025);
        break;
      case 'swap':
        playTone(329.63, 0.07, 'square', 0.025);
        setTimeout(() => playTone(523.25, 0.07, 'square', 0.025), 45);
        break;
      case 'visit':
      case 'enqueue':
      case 'dequeue':
        playTone(scaled, 0.065, 'triangle', 0.03);
        break;
      case 'push':
        playTone(440, 0.08, 'triangle', 0.035);
        break;
      case 'pop':
        playTone(293.66, 0.08, 'triangle', 0.035);
        break;
      case 'recurse':
        playTone(392 + index * 24, 0.07, 'sine', 0.03);
        break;
      case 'found':
        [523.25, 659.25, 783.99].forEach((freq, note) => setTimeout(() => playTone(freq, 0.1, 'sine', 0.045), note * 70));
        break;
      case 'not-found':
        playTone(185, 0.16, 'sawtooth', 0.035);
        break;
      case 'complete':
        [392, 523.25, 659.25, 783.99].forEach((freq, note) => setTimeout(() => playTone(freq, 0.11, 'sine', 0.045), note * 75));
        break;
      default:
        break;
    }
  }, [playTone]);

  const toggleSound = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    setSoundEnabled(enabled);
  }, []);

  return { soundEnabled, toggleSound, playEvent };
}
