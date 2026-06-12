import { describe, expect, it } from 'vitest';
import { randomInputFor } from '@/features/algorithms/linked-list/algorithms/randomInput';
import { buildLinkedListSteps } from '@/features/algorithms/linked-list/algorithms/linkedListAlgorithms';
import type { LLProblem } from '@/features/algorithms/linked-list/types/linkedListAlgo';

const ALL_PROBLEMS: LLProblem[] = [
  'find-middle',
  'reverse-list',
  'add-two-numbers',
  'reverse-k-group',
  'palindrome',
  'lru-cache',
  'segregate',
  'detect-cycle',
  'sort-list',
];

const parseList = (csv: string) =>
  csv.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));

describe('randomInputFor', () => {
  // Run each branch many times to defeat the internal Math.random() coin-flips.
  describe('returns a non-empty string for every problem (×40 each)', () => {
    for (const problem of ALL_PROBLEMS) {
      it(problem, () => {
        for (let i = 0; i < 40; i += 1) {
          const input = randomInputFor(problem);
          expect(typeof input).toBe('string');
          expect(input.length).toBeGreaterThan(0);
        }
      });
    }
  });

  describe('output feeds back into the step builder and terminates', () => {
    for (const problem of ALL_PROBLEMS) {
      it(problem, () => {
        for (let i = 0; i < 25; i += 1) {
          const steps = buildLinkedListSteps(problem, randomInputFor(problem));
          expect(steps.length).toBeGreaterThan(0);
          expect(steps[steps.length - 1].done).toBe(true);
        }
      });
    }
  });

  describe('plain list problems → comma-separated numbers within bounds', () => {
    for (const problem of ['find-middle', 'segregate', 'sort-list'] as LLProblem[]) {
      it(problem, () => {
        for (let i = 0; i < 30; i += 1) {
          const values = parseList(randomInputFor(problem));
          expect(values.length).toBeGreaterThan(0);
          for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(99);
          }
        }
      });
    }
  });

  it('palindrome: eventually emits an actual palindrome', () => {
    const isPalindrome = (csv: string) => {
      const v = parseList(csv);
      return v.join(',') === [...v].reverse().join(',');
    };
    const outputs = Array.from({ length: 50 }, () => randomInputFor('palindrome'));
    expect(outputs.some(isPalindrome)).toBe(true);
  });

  it('lru-cache: capacity prefix plus get/put ops', () => {
    for (let i = 0; i < 30; i += 1) {
      const out = randomInputFor('lru-cache');
      const [capRaw, opsRaw] = out.split(';');
      const capacity = Number(capRaw.trim());
      expect(capacity).toBeGreaterThanOrEqual(2);
      expect(capacity).toBeLessThanOrEqual(3);
      const ops = opsRaw.split(',').map((s) => s.trim());
      expect(ops.length).toBeGreaterThan(0);
      for (const op of ops) {
        expect(/^(get|put)\s+\d+(\s+\d+)?$/.test(op)).toBe(true);
      }
    }
  });

  it('detect-cycle: list plus a cycle position (-1 or a valid index)', () => {
    let sawCycle = false;
    let sawNoCycle = false;
    for (let i = 0; i < 60; i += 1) {
      const out = randomInputFor('detect-cycle');
      const [valuesRaw, posRaw] = out.split(';');
      const values = parseList(valuesRaw);
      const pos = Number(posRaw.trim());
      expect(values.length).toBeGreaterThan(0);
      if (pos === -1) {
        sawNoCycle = true;
      } else {
        sawCycle = true;
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(values.length);
      }
    }
    expect(sawCycle).toBe(true);
    expect(sawNoCycle).toBe(true);
  });

  it('falls back to a default list for unknown problems', () => {
    const values = parseList(randomInputFor('mystery' as LLProblem));
    expect(values).toHaveLength(6);
  });
});
