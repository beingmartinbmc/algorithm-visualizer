import type { SortingStep } from '../types/sorting';

export function selectionSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...arr], comparing: [minIdx, j], swapping: null, sorted: [...sorted] });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ array: [...arr], comparing: null, swapping: [i, minIdx], sorted: [...sorted] });
    }
    sorted.push(i);
  }

  sorted.push(n - 1);
  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: [...sorted] });
  return steps;
}
