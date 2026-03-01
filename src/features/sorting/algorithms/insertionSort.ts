import type { SortingStep } from '../types/sorting';

export function insertionSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const n = arr.length;
  const sorted: number[] = [0];

  for (let i = 1; i < n; i++) {
    let j = i;
    steps.push({ array: [...arr], comparing: [j - 1, j], swapping: null, sorted: [...sorted] });

    while (j > 0 && arr[j - 1] > arr[j]) {
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      steps.push({ array: [...arr], comparing: null, swapping: [j - 1, j], sorted: [...sorted] });
      j--;
      if (j > 0) {
        steps.push({ array: [...arr], comparing: [j - 1, j], swapping: null, sorted: [...sorted] });
      }
    }
    sorted.push(i);
  }

  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: Array.from({ length: n }, (_, i) => i) });
  return steps;
}
