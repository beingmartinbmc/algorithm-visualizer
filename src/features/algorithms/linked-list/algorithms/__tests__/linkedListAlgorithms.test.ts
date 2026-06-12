import { describe, expect, it } from 'vitest';
import { buildLinkedListSteps } from '@/features/algorithms/linked-list/algorithms/linkedListAlgorithms';
import type { LLProblem, LLStep } from '@/features/algorithms/linked-list/types/linkedListAlgo';

const last = (steps: LLStep[]) => steps[steps.length - 1];
const finalValues = (steps: LLStep[]) => last(steps).nodes.map((n) => n.value);

describe('linked-list algorithms', () => {
  describe('shared invariants', () => {
    const problems: { problem: LLProblem; input: string }[] = [
      { problem: 'find-middle', input: '10,20,30,40,50' },
      { problem: 'reverse-list', input: '1,2,3,4' },
      { problem: 'add-two-numbers', input: '342; 465' },
      { problem: 'reverse-k-group', input: '1,2,3,4,5,6,7; 3' },
      { problem: 'palindrome', input: '1,2,3,2,1' },
      { problem: 'lru-cache', input: '2; put 1 100, get 1, put 2 200, put 3 300, get 2' },
      { problem: 'segregate', input: '1,2,3,4,5,6' },
      { problem: 'detect-cycle', input: '1,2,3,4,5; 2' },
      { problem: 'sort-list', input: '5,3,8,1,9,2' },
    ];

    for (const { problem, input } of problems) {
      it(`${problem}: produces non-empty steps ending with done=true`, () => {
        const steps = buildLinkedListSteps(problem, input);
        expect(steps.length).toBeGreaterThan(0);
        expect(last(steps).done).toBe(true);
      });

      it(`${problem}: every step has a description and event`, () => {
        for (const step of buildLinkedListSteps(problem, input)) {
          expect(step.description.length).toBeGreaterThan(0);
          expect(step.event).toBeTruthy();
        }
      });
    }

    it('returns [] for an unknown problem', () => {
      expect(buildLinkedListSteps('does-not-exist' as LLProblem, '1,2,3')).toEqual([]);
    });
  });

  describe('find-middle (tortoise & hare)', () => {
    const middleValue = (steps: LLStep[]) => {
      const step = last(steps);
      const ptr = step.pointers.find((p) => p.name === 'middle');
      return ptr ? step.nodes[ptr.index].value : undefined;
    };

    it('odd length → exact middle', () => {
      expect(middleValue(buildLinkedListSteps('find-middle', '10,20,30,40,50'))).toBe(30);
    });

    it('even length → upper middle', () => {
      expect(middleValue(buildLinkedListSteps('find-middle', '10,20,30,40'))).toBe(30);
    });

    it('single-element input → that element is the middle', () => {
      expect(middleValue(buildLinkedListSteps('find-middle', '42'))).toBe(42);
    });
  });

  describe('reverse-list', () => {
    it('reverses values', () => {
      expect(finalValues(buildLinkedListSteps('reverse-list', '1,2,3,4,5'))).toEqual([5, 4, 3, 2, 1]);
    });

    it('single node unchanged', () => {
      expect(finalValues(buildLinkedListSteps('reverse-list', '7'))).toEqual([7]);
    });

    it('two nodes swap', () => {
      expect(finalValues(buildLinkedListSteps('reverse-list', '1,2'))).toEqual([2, 1]);
    });
  });

  describe('add-two-numbers (digits least-significant first)', () => {
    it('342 + 465 = 807 → [7,0,8]', () => {
      expect(finalValues(buildLinkedListSteps('add-two-numbers', '342; 465'))).toEqual([7, 0, 8]);
    });

    it('carry overflow 99 + 1 = 100 → [0,0,1]', () => {
      expect(finalValues(buildLinkedListSteps('add-two-numbers', '99; 1'))).toEqual([0, 0, 1]);
    });

    it('different lengths 5 + 999 = 1004 → [4,0,0,1]', () => {
      expect(finalValues(buildLinkedListSteps('add-two-numbers', '5; 999'))).toEqual([4, 0, 0, 1]);
    });
  });

  describe('reverse-k-group', () => {
    it('reverses each full group of k, leaving the trailing partial group', () => {
      expect(finalValues(buildLinkedListSteps('reverse-k-group', '1,2,3,4,5,6,7; 3'))).toEqual([3, 2, 1, 6, 5, 4, 7]);
    });

    it('k = 2 over an even list', () => {
      expect(finalValues(buildLinkedListSteps('reverse-k-group', '1,2,3,4; 2'))).toEqual([2, 1, 4, 3]);
    });

    it('k larger than list leaves it unchanged', () => {
      expect(finalValues(buildLinkedListSteps('reverse-k-group', '1,2,3; 5'))).toEqual([1, 2, 3]);
    });
  });

  describe('palindrome', () => {
    it('detects a palindrome', () => {
      expect(last(buildLinkedListSteps('palindrome', '1,2,3,2,1')).event).toBe('found');
    });

    it('rejects a non-palindrome', () => {
      expect(last(buildLinkedListSteps('palindrome', '1,2,3,4')).event).toBe('not-found');
    });

    it('empty list is a palindrome', () => {
      expect(last(buildLinkedListSteps('palindrome', '')).event).toBe('found');
    });
  });

  describe('segregate even/odd', () => {
    it('evens (preserving order) before odds', () => {
      expect(finalValues(buildLinkedListSteps('segregate', '17,15,8,12,10,5,4,1,7,6')))
        .toEqual([8, 12, 10, 4, 6, 17, 15, 5, 1, 7]);
    });

    it('all even stays in order', () => {
      expect(finalValues(buildLinkedListSteps('segregate', '2,4,6'))).toEqual([2, 4, 6]);
    });
  });

  describe('sort-list (merge sort)', () => {
    it('sorts ascending', () => {
      expect(finalValues(buildLinkedListSteps('sort-list', '40,10,70,30,90,20'))).toEqual([10, 20, 30, 40, 70, 90]);
    });

    it('handles duplicates', () => {
      expect(finalValues(buildLinkedListSteps('sort-list', '3,1,3,2,1'))).toEqual([1, 1, 2, 3, 3]);
    });

    it('single element', () => {
      expect(finalValues(buildLinkedListSteps('sort-list', '5'))).toEqual([5]);
    });
  });

  describe('detect-cycle (Floyd)', () => {
    it('detects and removes a cycle', () => {
      const steps = buildLinkedListSteps('detect-cycle', '1,2,3,4,5; 2');
      expect(last(steps).event).toBe('complete');
      expect(last(steps).cycleTo).toBeNull();
    });

    it('reports no cycle for an acyclic list', () => {
      const steps = buildLinkedListSteps('detect-cycle', '1,2,3,4,5; -1');
      expect(last(steps).event).toBe('not-found');
    });
  });

  describe('lru-cache', () => {
    it('evicts the least-recently-used entry when full', () => {
      // capacity 2; after put1,put2,get1,put3 → key 2 should be evicted.
      const steps = buildLinkedListSteps('lru-cache', '2; put 1 100, put 2 200, get 1, put 3 300');
      const finalEntries = last(steps).lru?.entries ?? [];
      const keys = finalEntries.map((e) => e.key).sort((a, b) => a - b);
      expect(keys).toEqual([1, 3]);
    });

    it('most-recently-used sits at the front', () => {
      const steps = buildLinkedListSteps('lru-cache', '2; put 1 100, put 2 200, get 1');
      expect(last(steps).lru?.entries[0].key).toBe(1);
    });

    it('respects capacity at all times', () => {
      const steps = buildLinkedListSteps('lru-cache', '2; put 1 1, put 2 2, put 3 3, put 4 4');
      for (const step of steps) {
        if (step.lru) expect(step.lru.entries.length).toBeLessThanOrEqual(2);
      }
    });
  });
});
