import type { Individual } from './types';
import type { RNG } from './random';

export function singlePointCrossover(
  parentA: Individual,
  parentB: Individual,
  crossoverRate: number,
  rng: RNG,
): string {
  const length = parentA.genes.length;
  if (length <= 1) return parentA.genes;
  if (rng.next() > crossoverRate) return parentA.genes;

  const point = rng.int(1, length - 1);
  return parentA.genes.slice(0, point) + parentB.genes.slice(point);
}
