import type { SortingStep } from '../types/sorting';

export function quickSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const sorted: number[] = [];

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], swapping: null, sorted: [...sorted], pivot: high });

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ array: [...arr], comparing: null, swapping: [i, j], sorted: [...sorted], pivot: high });
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ array: [...arr], comparing: null, swapping: [i + 1, high], sorted: [...sorted], pivot: i + 1 });
    sorted.push(i + 1);
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  sort(0, arr.length - 1);
  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: Array.from({ length: arr.length }, (_, i) => i) });
  return steps;
}
