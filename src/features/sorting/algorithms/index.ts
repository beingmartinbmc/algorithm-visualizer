import type { SortingAlgorithmType, SortingStep } from '../types/sorting';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { quickSort } from './quickSort';
import { heapSort } from './heapSort';
import { mergeSort } from './mergeSort';

const algorithmMap: Record<SortingAlgorithmType, (arr: number[]) => SortingStep[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  quick: quickSort,
  heap: heapSort,
  merge: mergeSort,
};

export function runSortingAlgorithm(type: SortingAlgorithmType, arr: number[]): SortingStep[] {
  return algorithmMap[type](arr);
}

export { bubbleSort, selectionSort, insertionSort, quickSort, heapSort, mergeSort };
