import type { Individual } from './types';
import type { RNG } from './random';

export function randomGene(length: number, allowedChars: string, rng: RNG): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += allowedChars[rng.int(0, allowedChars.length - 1)];
  }
  return out;
}

export function initializePopulation(
  populationSize: number,
  targetLength: number,
  allowedChars: string,
  rng: RNG,
): Individual[] {
  const size = Math.max(1, populationSize);
  const pop: Individual[] = [];
  for (let i = 0; i < size; i++) {
    pop.push({ genes: randomGene(targetLength, allowedChars, rng), fitness: 0 });
  }
  return pop;
}
