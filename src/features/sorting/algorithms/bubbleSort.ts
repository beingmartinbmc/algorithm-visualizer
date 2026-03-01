import type { SortingStep } from '../types/sorting';

export function bubbleSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...arr], comparing: [j, j + 1], swapping: null, sorted: [...sorted] });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ array: [...arr], comparing: null, swapping: [j, j + 1], sorted: [...sorted] });
      }
    }
    sorted.unshift(n - 1 - i);
  }

  sorted.unshift(0);
  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: [...sorted] });
  return steps;
}
