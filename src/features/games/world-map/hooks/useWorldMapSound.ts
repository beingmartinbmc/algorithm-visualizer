import { useCallback, useRef, useState } from 'react';

const RADAR_SCALE = [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99];

export function useWorldMapSound() {
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

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.045) => {
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

  const playArpeggio = useCallback((freqs: number[], type: OscillatorType, noteLength: number, volume = 0.04) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = ctx.currentTime + index * noteLength * 0.75;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteLength);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + noteLength);
    });
  }, [getCtx]);

  const playAirportSelect = useCallback(() => {
    playTone(523.25, 0.08, 'triangle', 0.035);
  }, [playTone]);

  const playRoutePlanned = useCallback(() => {
    playArpeggio([392.0, 523.25, 659.25], 'sine', 0.1, 0.045);
  }, [playArpeggio]);

  const playScanStep = useCallback((stepIndex: number) => {
    playTone(RADAR_SCALE[stepIndex % RADAR_SCALE.length], 0.055, 'sine', 0.025);
  }, [playTone]);

  const playFlightStart = useCallback(() => {
    playArpeggio([196.0, 246.94, 329.63, 392.0], 'triangle', 0.09, 0.04);
  }, [playArpeggio]);

  const playWaypoint = useCallback((segmentIndex: number) => {
    playTone(segmentIndex % 2 === 0 ? 587.33 : 659.25, 0.09, 'triangle', 0.035);
  }, [playTone]);

  const playArrive = useCallback(() => {
    playArpeggio([523.25, 659.25, 783.99, 1046.5], 'sine', 0.11, 0.05);
  }, [playArpeggio]);

  const playPause = useCallback(() => {
    playTone(220.0, 0.08, 'sawtooth', 0.025);
  }, [playTone]);

  const toggleSound = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    setSoundEnabled(enabled);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playAirportSelect,
    playRoutePlanned,
    playScanStep,
    playFlightStart,
    playWaypoint,
    playArrive,
    playPause,
  };
}
