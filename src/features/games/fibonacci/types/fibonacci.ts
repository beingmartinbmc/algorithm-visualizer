export type GameMode = 'guided' | 'challenge' | 'sandbox';

export type Direction = 'right' | 'up' | 'left' | 'down';

export const DIRECTION_ORDER: Direction[] = ['right', 'up', 'left', 'down'];

export interface PlacedSquare {
  id: number;
  size: number;
  x: number;
  y: number;
  direction: Direction;
  fibIndex: number;
}

export interface DragBlock {
  id: number;
  size: number;
  isCorrect: boolean;
}

export interface GameState {
  mode: GameMode;
  sequence: number[];
  placedSquares: PlacedSquare[];
  score: number;
  streak: number;
  timer: number;
  isTimerRunning: boolean;
  isComplete: boolean;
  lastError: string | null;
  showHint: boolean;
}

export const MODE_INFO: Record<GameMode, { name: string; description: string }> = {
  guided: {
    name: 'Guided',
    description: 'Learn step-by-step with hints and formula guidance.',
  },
  challenge: {
    name: 'Challenge',
    description: 'Race against time! Pick the right block from multiple choices.',
  },
  sandbox: {
    name: 'Sandbox',
    description: 'Explore freely with no scoring or time pressure.',
  },
};

export const GAME_DESCRIPTION = {
  title: 'Fibonacci Spiral Builder',
  subtitle: 'Inspired by Leonardo Fibonacci',
  what: 'Build a golden spiral by placing squares in the Fibonacci sequence. Each square\'s side length equals the sum of the two before it (1, 1, 2, 3, 5, 8, 13...). As you place them, a beautiful spiral emerges — the same pattern found in sunflowers, seashells, and galaxies.',
  skills: [
    'Pattern Recognition',
    'Mathematical Sequences',
    'Spatial Reasoning',
    'Golden Ratio Intuition',
  ],
};
