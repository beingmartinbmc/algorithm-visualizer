import type { SortingStep } from '../types/sorting';

export function heapSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  function heapify(size: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      steps.push({ array: [...arr], comparing: [largest, left], swapping: null, sorted: [...sorted] });
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      steps.push({ array: [...arr], comparing: [largest, right], swapping: null, sorted: [...sorted] });
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      steps.push({ array: [...arr], comparing: null, swapping: [i, largest], sorted: [...sorted] });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({ array: [...arr], comparing: null, swapping: [0, i], sorted: [...sorted] });
    sorted.push(i);
    heapify(i, 0);
  }

  sorted.push(0);
  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: [...sorted] });
  return steps;
}
