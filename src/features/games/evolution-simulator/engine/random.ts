export interface RNG {
  next: () => number; // [0,1)
  int: (min: number, max: number) => number; // inclusive
}

export function createRng(seed: number): RNG {
  let s = seed >>> 0;

  const next = () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const int = (min: number, max: number) => {
    if (max <= min) return min;
    return Math.floor(next() * (max - min + 1)) + min;
  };

  return { next, int };
}
