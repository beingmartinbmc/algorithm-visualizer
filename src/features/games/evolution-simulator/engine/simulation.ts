import { createRng } from './random';
import type { EvolutionConfig, EvolutionState, Individual } from './types';
import { initializePopulation } from './population';
import { evaluatePopulation, averageFitness } from './fitness';
import { selectParent } from './selection';
import { singlePointCrossover } from './crossover';
import { mutateGenes } from './mutation';

function cloneIndividual(ind: Individual): Individual {
  return { genes: ind.genes, fitness: ind.fitness };
}

function sortByFitness(population: Individual[]): Individual[] {
  return [...population].sort((a, b) => b.fitness - a.fitness);
}

function stateMessage(bestFitness: number, targetLength: number, generation: number, maxGenerations: number): string {
  if (targetLength === 0) return 'Target is empty. Enter a target to evolve.';
  if (bestFitness >= targetLength) return `Solution found in ${generation} generations`;
  if (generation >= maxGenerations) return 'Max generations reached without full match';
  return 'Evolving...';
}

export function initializeEvolution(config: EvolutionConfig, seed: number): EvolutionState {
  const targetLength = config.target.length;
  const rng = createRng(seed);

  const initial = initializePopulation(
    config.populationSize,
    targetLength,
    config.allowedChars,
    rng,
  );

  const evaluated = sortByFitness(evaluatePopulation(initial, config.target));
  const best = evaluated[0] ?? { genes: '', fitness: 0 };
  const avg = averageFitness(evaluated);
  const done = targetLength === 0 || best.fitness >= targetLength;

  return {
    generation: 0,
    population: evaluated,
    bestIndividual: cloneIndividual(best),
    averageFitness: avg,
    bestFitnessHistory: [best.fitness],
    averageFitnessHistory: [avg],
    rngSeed: seed,
    done,
    message: stateMessage(best.fitness, targetLength, 0, config.maxGenerations),
  };
}

export function evolveNextGeneration(config: EvolutionConfig, state: EvolutionState): EvolutionState {
  if (state.done) return state;

  const targetLength = config.target.length;
  const rng = createRng(state.rngSeed + state.generation + 1);
  const current = sortByFitness(evaluatePopulation(state.population, config.target));
  const elite = current[0] ? cloneIndividual(current[0]) : { genes: '', fitness: 0 };

  const nextPopulation: Individual[] = [elite];

  while (nextPopulation.length < Math.max(1, config.populationSize)) {
    const parentA = selectParent(current, config.selectionStrategy, config.tournamentSize, rng);
    const parentB = selectParent(current, config.selectionStrategy, config.tournamentSize, rng);

    const childGenes = singlePointCrossover(parentA, parentB, config.crossoverRate, rng);
    const mutatedGenes = mutateGenes(childGenes, config.mutationRate, config.allowedChars, rng);

    nextPopulation.push({ genes: mutatedGenes, fitness: 0 });
  }

  const evaluated = sortByFitness(evaluatePopulation(nextPopulation, config.target));
  const generation = state.generation + 1;
  const best = evaluated[0] ?? elite;
  const avg = averageFitness(evaluated);
  const done = best.fitness >= targetLength || generation >= config.maxGenerations;

  return {
    generation,
    population: evaluated,
    bestIndividual: cloneIndividual(best),
    averageFitness: avg,
    bestFitnessHistory: [...state.bestFitnessHistory, best.fitness],
    averageFitnessHistory: [...state.averageFitnessHistory, avg],
    rngSeed: state.rngSeed,
    done,
    message: stateMessage(best.fitness, targetLength, generation, config.maxGenerations),
  };
}
