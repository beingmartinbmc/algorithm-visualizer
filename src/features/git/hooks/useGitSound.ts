import { useRef, useCallback, useState } from 'react';
import type { GitAction } from '../types/git';

export function useGitSound() {
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
    [getCtx],
  );

  const playChord = useCallback(
    (freqs: number[], type: OscillatorType, duration: number, volume = 0.04) => {
      if (!enabledRef.current) return;
      for (const freq of freqs) playTone(freq, type, duration, volume);
    },
    [playTone],
  );

  const playArpeggio = useCallback(
    (freqs: number[], type: OscillatorType, noteLen: number, volume = 0.05) => {
      if (!enabledRef.current) return;
      const ctx = getCtx();
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * noteLen * 0.7;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteLen);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + noteLen);
      });
    },
    [getCtx],
  );

  const playInit = useCallback(() => {
    playArpeggio([261.63, 329.63, 392.0, 523.25], 'sine', 0.15);
  }, [playArpeggio]);

  const playAdd = useCallback(() => {
    playTone(440, 'sine', 0.1);
  }, [playTone]);

  const playCommit = useCallback(() => {
    playArpeggio([523.25, 659.25, 783.99], 'sine', 0.12);
  }, [playArpeggio]);

  const playBranch = useCallback(() => {
    playTone(587.33, 'triangle', 0.18);
  }, [playTone]);

  const playCheckout = useCallback(() => {
    playArpeggio([392.0, 493.88], 'triangle', 0.1);
  }, [playArpeggio]);

  const playMerge = useCallback(() => {
    playChord([523.25, 659.25, 783.99], 'sine', 0.3);
  }, [playChord]);

  const playRebase = useCallback(() => {
    playArpeggio([329.63, 392.0, 493.88, 587.33], 'triangle', 0.1);
  }, [playArpeggio]);

  const playReset = useCallback(() => {
    playArpeggio([493.88, 392.0, 329.63], 'sawtooth', 0.1, 0.03);
  }, [playArpeggio]);

  const playStash = useCallback(() => {
    playTone(349.23, 'triangle', 0.15);
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(196.0, 'sawtooth', 0.2, 0.04);
  }, [playTone]);

  const playInfo = useCallback(() => {
    playTone(523.25, 'sine', 0.06, 0.03);
  }, [playTone]);

  const playForAction = useCallback(
    (action?: GitAction) => {
      switch (action) {
        case 'init':
          playInit();
          break;
        case 'add':
          playAdd();
          break;
        case 'commit':
          playCommit();
          break;
        case 'branch-create':
          playBranch();
          break;
        case 'branch-list':
          playInfo();
          break;
        case 'checkout':
          playCheckout();
          break;
        case 'merge':
        case 'merge-fast-forward':
          playMerge();
          break;
        case 'rebase':
          playRebase();
          break;
        case 'reset-soft':
        case 'reset-mixed':
        case 'reset-hard':
          playReset();
          break;
        case 'stash-push':
        case 'stash-pop':
          playStash();
          break;
        case 'cherry-pick':
          playCommit();
          break;
        case 'tag':
          playBranch();
          break;
        case 'log':
        case 'status':
        case 'diff':
          playInfo();
          break;
        case 'error':
          playError();
          break;
        default:
          break;
      }
    },
    [playInit, playAdd, playCommit, playBranch, playCheckout, playMerge, playRebase, playReset, playStash, playError, playInfo],
  );

  const toggleSound = useCallback((val: boolean) => {
    enabledRef.current = val;
    setSoundEnabled(val);
  }, []);

  return { soundEnabled, toggleSound, playForAction };
}
