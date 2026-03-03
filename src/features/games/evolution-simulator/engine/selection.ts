import type { Individual, SelectionStrategy } from './types';
import type { RNG } from './random';

function rouletteSelection(population: Individual[], rng: RNG): Individual {
  const totalFitness = population.reduce((sum, p) => sum + p.fitness, 0);
  if (totalFitness <= 0) {
    return population[rng.int(0, population.length - 1)];
  }

  const threshold = rng.next() * totalFitness;
  let cumulative = 0;
  for (let i = 0; i < population.length; i++) {
    cumulative += population[i].fitness;
    if (cumulative >= threshold) return population[i];
  }
  return population[population.length - 1];
}

function tournamentSelection(population: Individual[], tournamentSize: number, rng: RNG): Individual {
  let best = population[rng.int(0, population.length - 1)];
  const k = Math.max(1, tournamentSize);
  for (let i = 1; i < k; i++) {
    const candidate = population[rng.int(0, population.length - 1)];
    if (candidate.fitness > best.fitness) best = candidate;
  }
  return best;
}

export function selectParent(
  population: Individual[],
  strategy: SelectionStrategy,
  tournamentSize: number,
  rng: RNG,
): Individual {
  if (strategy === 'tournament') return tournamentSelection(population, tournamentSize, rng);
  return rouletteSelection(population, rng);
}
