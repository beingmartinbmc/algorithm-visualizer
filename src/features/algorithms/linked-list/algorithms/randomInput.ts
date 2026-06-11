import type { LLProblem } from '../types/linkedListAlgo';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function randList(len: number, min = 1, max = 99): number[] {
  return Array.from({ length: len }, () => rand(min, max));
}

/** Generates a fresh, sensible input string for the "Random" button. */
export function randomInputFor(problem: LLProblem): string {
  switch (problem) {
    case 'find-middle':
      return randList(rand(5, 9)).join(',');

    case 'palindrome': {
      // Build a real palindrome ~60% of the time so both outcomes show up.
      const half = randList(rand(2, 3));
      if (Math.random() < 0.6) {
        const middle = Math.random() < 0.5 ? [rand(1, 9)] : [];
        return [...half, ...middle, ...[...half].reverse()].join(',');
      }
      return randList(rand(4, 7)).join(',');
    }

    case 'lru-cache': {
      const capacity = rand(2, 3);
      const keys = [1, 2, 3, 4, 5];
      const ops: string[] = [];
      for (let i = 0; i < rand(7, 9); i += 1) {
        const key = keys[rand(0, keys.length - 1)];
        if (Math.random() < 0.55) ops.push(`put ${key} ${rand(1, 9) * 100}`);
        else ops.push(`get ${key}`);
      }
      return `${capacity}; ${ops.join(', ')}`;
    }

    case 'segregate':
      return randList(rand(6, 10)).join(',');

    case 'detect-cycle': {
      const len = rand(5, 8);
      const values = randList(len);
      // ~70% chance of an actual cycle
      const pos = Math.random() < 0.7 ? rand(0, len - 1) : -1;
      return `${values.join(',')}; ${pos}`;
    }

    case 'sort-list':
      return randList(rand(6, 9)).join(',');

    default:
      return randList(6).join(',');
  }
}
