export type SortingAlgorithmType = 'bubble' | 'selection' | 'insertion' | 'quick' | 'heap' | 'merge';

export interface SortingStep {
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  pivot?: number;
}

export type VisualizationSpeed = 'slow' | 'medium' | 'fast' | 'instant';

export const SPEED_MAP: Record<VisualizationSpeed, number> = {
  slow: 100,
  medium: 30,
  fast: 8,
  instant: 0,
};

export const SORTING_ALGORITHM_INFO: Record<SortingAlgorithmType, { name: string; description: string; timeComplexity: string; spaceComplexity: string; stable: boolean }> = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements if they are in the wrong order. Simple but inefficient for large datasets.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
  },
  selection: {
    name: 'Selection Sort',
    description: 'Finds the minimum element and places it at the beginning. Performs well on small arrays.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: false,
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds the sorted array one element at a time by inserting each into its correct position.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: true,
  },
  quick: {
    name: 'Quick Sort',
    description: 'Divides the array using a pivot and recursively sorts the partitions. Very efficient in practice.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    stable: false,
  },
  heap: {
    name: 'Heap Sort',
    description: 'Builds a max-heap then repeatedly extracts the maximum to build the sorted array.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    stable: false,
  },
  merge: {
    name: 'Merge Sort',
    description: 'Divides the array in half, recursively sorts, then merges. Guarantees consistent performance.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    stable: true,
  },
};
