import type { SortingStep } from '../types/sorting';

export function mergeSort(inputArray: number[]): SortingStep[] {
  const arr = [...inputArray];
  const steps: SortingStep[] = [];
  const sorted: number[] = [];

  function merge(left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ array: [...arr], comparing: [left + i, mid + 1 + j], swapping: null, sorted: [...sorted] });

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      steps.push({ array: [...arr], comparing: null, swapping: [k, k], sorted: [...sorted] });
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      steps.push({ array: [...arr], comparing: null, swapping: [k, k], sorted: [...sorted] });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      steps.push({ array: [...arr], comparing: null, swapping: [k, k], sorted: [...sorted] });
      j++;
      k++;
    }
  }

  function sort(left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      sort(left, mid);
      sort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  sort(0, arr.length - 1);
  steps.push({ array: [...arr], comparing: null, swapping: null, sorted: Array.from({ length: arr.length }, (_, i) => i) });
  return steps;
}
