import type { EvolutionConfig } from './types';

export const DEFAULT_ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?-';

export const DEFAULT_CONFIG: EvolutionConfig = {
  target: 'HELLO WORLD',
  populationSize: 300,
  mutationRate: 0.03,
  crossoverRate: 0.75,
  maxGenerations: 500,
  selectionStrategy: 'roulette',
  tournamentSize: 5,
  allowedChars: DEFAULT_ALLOWED_CHARS,
};

export const RANDOM_TARGETS = [
  'HELLO WORLD',
  'GENETIC ALGORITHM',
  'EVOLUTION IN ACTION',
  'SURVIVAL OF THE FITTEST',
  'OPTIMIZE THE GENES',
];
