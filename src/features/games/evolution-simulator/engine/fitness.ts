import type { Individual } from './types';

export function computeFitness(genes: string, target: string): number {
  if (target.length === 0) return 0;
  let score = 0;
  for (let i = 0; i < target.length; i++) {
    if (genes[i] === target[i]) score += 1;
  }
  return score;
}

export function evaluatePopulation(population: Individual[], target: string): Individual[] {
  return population.map((individual) => ({
    ...individual,
    fitness: computeFitness(individual.genes, target),
  }));
}

export function averageFitness(population: Individual[]): number {
  if (population.length === 0) return 0;
  const total = population.reduce((sum, p) => sum + p.fitness, 0);
  return total / population.length;
}
