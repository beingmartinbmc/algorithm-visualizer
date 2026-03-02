import type { SortingAlgorithmType } from '@/features/sorting/types/sorting';

export type BattleCategory = 'sorting';

export type GameMode = 'realtime' | 'turbo' | 'prediction';

export type BattleStatus = 'setup' | 'running' | 'paused' | 'finished';

export type InputType = 'random' | 'nearly-sorted' | 'reversed' | 'custom';

export interface BattleMetrics {
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
  totalOperations: number;
  timeElapsed: number;
  stepsCompleted: number;
  totalSteps: number;
}

export interface AlgorithmState {
  algorithm: SortingAlgorithmType;
  metrics: BattleMetrics;
  status: 'running' | 'finished';
  currentStepIndex: number;
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
}

export interface BattleState {
  category: BattleCategory;
  algorithmA: SortingAlgorithmType;
  algorithmB: SortingAlgorithmType;
  inputData: number[];
  inputSize: number;
  inputType: InputType;
  stateA: AlgorithmState;
  stateB: AlgorithmState;
  status: BattleStatus;
  gameMode: GameMode;
  speed: number;
  winner: 'A' | 'B' | 'tie' | null;
  prediction: 'A' | 'B' | null;
  predictionCorrect: boolean | null;
}

export function emptyMetrics(): BattleMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    arrayAccesses: 0,
    totalOperations: 0,
    timeElapsed: 0,
    stepsCompleted: 0,
    totalSteps: 0,
  };
}

export const ALGORITHM_OPTIONS: { value: SortingAlgorithmType; label: string }[] = [
  { value: 'bubble', label: 'Bubble Sort' },
  { value: 'selection', label: 'Selection Sort' },
  { value: 'insertion', label: 'Insertion Sort' },
  { value: 'quick', label: 'Quick Sort' },
  { value: 'heap', label: 'Heap Sort' },
  { value: 'merge', label: 'Merge Sort' },
];

export const COMPLEXITY_INFO: Record<SortingAlgorithmType, { best: string; average: string; worst: string; space: string }> = {
  bubble:    { best: 'O(n)',      average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  selection: { best: 'O(n²)',     average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  insertion: { best: 'O(n)',      average: 'O(n²)',     worst: 'O(n²)',     space: 'O(1)' },
  quick:     { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)',   space: 'O(log n)' },
  heap:      { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  merge:     { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
};

export const SPEED_PRESETS: { label: string; value: number }[] = [
  { label: 'Slow', value: 150 },
  { label: 'Medium', value: 50 },
  { label: 'Fast', value: 15 },
  { label: 'Turbo', value: 1 },
];

export function generateInput(size: number, type: InputType): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * size) + 1);
  }
  if (type === 'nearly-sorted') {
    arr.sort((a, b) => a - b);
    const swaps = Math.max(1, Math.floor(size * 0.05));
    for (let i = 0; i < swaps; i++) {
      const a = Math.floor(Math.random() * size);
      const b = Math.min(a + Math.floor(Math.random() * 3) + 1, size - 1);
      [arr[a], arr[b]] = [arr[b], arr[a]];
    }
  } else if (type === 'reversed') {
    arr.sort((a, b) => b - a);
  }
  return arr;
}

export function getWinExplanation(
  winner: 'A' | 'B' | 'tie',
  algA: SortingAlgorithmType,
  algB: SortingAlgorithmType,
  metricsA: BattleMetrics,
  metricsB: BattleMetrics,
  inputType: InputType,
): string {
  const nameA = ALGORITHM_OPTIONS.find((o) => o.value === algA)!.label;
  const nameB = ALGORITHM_OPTIONS.find((o) => o.value === algB)!.label;

  if (winner === 'tie') {
    return `Both ${nameA} and ${nameB} completed in the same number of operations. This can happen with small inputs or similar-complexity algorithms.`;
  }

  const winnerName = winner === 'A' ? nameA : nameB;
  const loserName = winner === 'A' ? nameB : nameA;
  const winnerMetrics = winner === 'A' ? metricsA : metricsB;
  const loserMetrics = winner === 'A' ? metricsB : metricsA;
  const ratio = (loserMetrics.totalSteps / Math.max(winnerMetrics.totalSteps, 1)).toFixed(1);

  let reason = `${winnerName} won with ${winnerMetrics.totalSteps} steps vs ${loserMetrics.totalSteps} steps (${ratio}x fewer operations). `;

  if (inputType === 'nearly-sorted') {
    reason += `On nearly-sorted data, algorithms like Insertion Sort have a natural advantage due to their O(n) best-case performance.`;
  } else if (inputType === 'reversed') {
    reason += `Reversed input is the worst case for O(n²) algorithms, making the performance gap with O(n log n) algorithms very visible.`;
  } else {
    reason += `${loserName} performed more operations because its average-case complexity is higher for this input distribution.`;
  }

  return reason;
}
