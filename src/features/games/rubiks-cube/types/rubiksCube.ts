export type CubeFace = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type CubeColor = 'white' | 'yellow' | 'green' | 'blue' | 'orange' | 'red';

export type CubeState = Record<CubeFace, CubeColor[]>;

export type TurnFace = CubeFace;

export type TurnSuffix = '' | "'" | '2';

export type CubeMove = `${TurnFace}${TurnSuffix}`;

export type RubiksMode = 'guided' | 'freeplay' | 'challenge';

export type SolvePhase = 'Cross' | 'F2L' | '2-Look OLL' | '2-Look PLL';

export interface SolutionStep {
  move: CubeMove;
  description: string;
  phase: SolvePhase;
}

export interface GuidedLesson {
  title: string;
  goal: string;
  steps: string[];
}

export interface Challenge {
  id: string;
  title: string;
  scramble: CubeMove[];
  targetMoves: number;
  description: string;
}

export interface SimulationResult {
  runs: number;
  best: {
    scramble: CubeMove[];
    solutionLength: number;
  };
  worst: {
    scramble: CubeMove[];
    solutionLength: number;
  };
  averageLength: number;
}

export const FACE_LABELS: Record<CubeFace, string> = {
  U: 'Up',
  D: 'Down',
  F: 'Front',
  B: 'Back',
  L: 'Left',
  R: 'Right',
};

export const FACE_COLORS: Record<CubeColor, string> = {
  white: '#f8fafc',
  yellow: '#facc15',
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f97316',
  red: '#ef4444',
};

export const ALL_MOVES: CubeMove[] = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
  'L', "L'", 'L2',
  'R', "R'", 'R2',
];
