import type { RNG } from './random';

export function mutateGenes(
  genes: string,
  mutationRate: number,
  allowedChars: string,
  rng: RNG,
): string {
  if (genes.length === 0) return genes;
  let out = '';
  for (let i = 0; i < genes.length; i++) {
    if (rng.next() < mutationRate) {
      out += allowedChars[rng.int(0, allowedChars.length - 1)];
    } else {
      out += genes[i];
    }
  }
  return out;
}
