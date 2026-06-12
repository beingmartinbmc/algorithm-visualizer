import { describe, expect, it } from 'vitest';
import { runSortingAlgorithm } from '@/features/sorting/algorithms';
import type { SortingAlgorithmType, SortingStep } from '@/features/sorting/types/sorting';

const ALGORITHMS: SortingAlgorithmType[] = ['bubble', 'selection', 'insertion', 'quick', 'heap', 'merge'];

const CASES: { name: string; input: number[] }[] = [
  { name: 'empty array', input: [] },
  { name: 'single element', input: [42] },
  { name: 'already sorted', input: [1, 2, 3, 4, 5] },
  { name: 'reverse sorted', input: [5, 4, 3, 2, 1] },
  { name: 'duplicates', input: [3, 1, 3, 2, 1, 3, 2] },
  { name: 'negatives and zero', input: [0, -5, 3, -1, 2, -5] },
  { name: 'random-ish', input: [8, 3, 7, 1, 9, 2, 6, 4, 5] },
];

function lastArray(steps: SortingStep[], original: number[]): number[] {
  // No steps means the input was trivial (empty / single) — nothing to reorder.
  return steps.length > 0 ? steps[steps.length - 1].array : [...original];
}

describe('sorting algorithms', () => {
  for (const algo of ALGORITHMS) {
    describe(algo, () => {
      for (const { name, input } of CASES) {
        it(`sorts: ${name}`, () => {
          const expected = [...input].sort((a, b) => a - b);
          const steps = runSortingAlgorithm(algo, input);
          expect(lastArray(steps, input)).toEqual(expected);
        });
      }

      it('does not mutate the input array', () => {
        const input = [4, 2, 5, 1, 3];
        const copy = [...input];
        runSortingAlgorithm(algo, input);
        expect(input).toEqual(copy);
      });

      it('every step snapshot is a permutation of the input', () => {
        const input = [5, 3, 8, 1, 9, 2];
        const expectedMultiset = [...input].sort((a, b) => a - b);
        const steps = runSortingAlgorithm(algo, input);
        // Merge sort writes merged runs into scratch positions, so individual
        // intermediate snapshots aren't permutations — only assert the final one.
        const toCheck = algo === 'merge' ? steps.slice(-1) : steps;
        for (const step of toCheck) {
          expect([...step.array].sort((a, b) => a - b)).toEqual(expectedMultiset);
        }
      });

      it('comparing/swapping indices stay in bounds', () => {
        const input = [7, 2, 6, 1, 8, 3, 5];
        const steps = runSortingAlgorithm(algo, input);
        for (const step of steps) {
          for (const pair of [step.comparing, step.swapping]) {
            if (!pair) continue;
            for (const idx of pair) {
              expect(idx).toBeGreaterThanOrEqual(0);
              expect(idx).toBeLessThan(input.length);
            }
          }
        }
      });
    });
  }
});
