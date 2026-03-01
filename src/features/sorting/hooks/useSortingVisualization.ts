import { useState, useCallback, useRef } from 'react';
import type { SortingAlgorithmType, SortingStep, VisualizationSpeed } from '../types/sorting';
import { SPEED_MAP } from '../types/sorting';
import { runSortingAlgorithm } from '../algorithms';
import { useSortingSound } from './useSortingSound';

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

export function useSortingVisualization() {
  const [algorithm, setAlgorithm] = useState<SortingAlgorithmType>('bubble');
  const [speed, setSpeed] = useState<VisualizationSpeed>('fast');
  const [arraySize, setArraySize] = useState(50);
  const [array, setArray] = useState<number[]>(() => generateRandomArray(50));
  const [comparing, setComparing] = useState<[number, number] | null>(null);
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timeoutsRef = useRef<number[]>([]);
  const { playTone, playCompleteSweep, setEnabled } = useSortingSound();

  const toggleSound = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, [setEnabled]);

  const generateNewArray = useCallback(() => {
    setArray(generateRandomArray(arraySize));
    setComparing(null);
    setSwapping(null);
    setSortedIndices([]);
    setIsFinished(false);
    setCurrentStep(0);
    setTotalSteps(0);
  }, [arraySize]);

  const changeArraySize = useCallback((size: number) => {
    setArraySize(size);
    setArray(generateRandomArray(size));
    setComparing(null);
    setSwapping(null);
    setSortedIndices([]);
    setIsFinished(false);
    setCurrentStep(0);
    setTotalSteps(0);
  }, []);

  const stopVisualization = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    setIsRunning(false);
    setComparing(null);
    setSwapping(null);
  }, []);

  const visualize = useCallback(() => {
    stopVisualization();
    setIsFinished(false);
    setComparing(null);
    setSwapping(null);
    setSortedIndices([]);
    setCurrentStep(0);

    const steps: SortingStep[] = runSortingAlgorithm(algorithm, array);
    setTotalSteps(steps.length);

    if (steps.length === 0) {
      setIsFinished(true);
      return;
    }

    const delay = SPEED_MAP[speed];
    const maxVal = Math.max(...array);
    setIsRunning(true);

    if (delay === 0) {
      const lastStep = steps[steps.length - 1];
      setArray(lastStep.array);
      setSortedIndices(lastStep.sorted);
      setComparing(null);
      setSwapping(null);
      setCurrentStep(steps.length);
      setIsRunning(false);
      setIsFinished(true);
      playCompleteSweep(lastStep.array.length);
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      const timeout = window.setTimeout(() => {
        const step = steps[i];
        setArray(step.array);
        setComparing(step.comparing);
        setSwapping(step.swapping);
        setSortedIndices(step.sorted);
        setCurrentStep(i + 1);

        if (step.comparing) {
          const idx = step.comparing[0];
          playTone(step.array[idx], maxVal, speed, 'compare');
        }
        if (step.swapping) {
          const idx = step.swapping[0];
          playTone(step.array[idx], maxVal, speed, 'swap');
        }

        if (i === steps.length - 1) {
          setIsRunning(false);
          setIsFinished(true);
          setComparing(null);
          setSwapping(null);
          playCompleteSweep(step.array.length);
        }
      }, delay * i);
      timeoutsRef.current.push(timeout);
    }
  }, [algorithm, array, speed, stopVisualization, playTone, playCompleteSweep]);

  return {
    algorithm,
    setAlgorithm,
    speed,
    setSpeed,
    arraySize,
    changeArraySize,
    array,
    comparing,
    swapping,
    sortedIndices,
    isRunning,
    isFinished,
    currentStep,
    totalSteps,
    soundEnabled,
    toggleSound,
    generateNewArray,
    visualize,
    stopVisualization,
  };
}
