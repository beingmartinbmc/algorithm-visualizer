export interface Individual {
  genes: string;
  fitness: number;
}

export type SelectionStrategy = 'roulette' | 'tournament';

export interface EvolutionConfig {
  target: string;
  populationSize: number;
  mutationRate: number; // 0..1
  crossoverRate: number; // 0..1
  maxGenerations: number;
  selectionStrategy: SelectionStrategy;
  tournamentSize: number;
  allowedChars: string;
}

export interface EvolutionState {
  generation: number;
  population: Individual[];
  bestIndividual: Individual;
  averageFitness: number;
  bestFitnessHistory: number[];
  averageFitnessHistory: number[];
  rngSeed: number;
  done: boolean;
  message: string;
}
