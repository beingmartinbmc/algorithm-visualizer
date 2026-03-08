// Rubik's Cube Engine Types

export type FaceColor = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';

// Face indices: U=0, D=1, F=2, B=3, L=4, R=5
export type FaceIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const FACE_NAMES = ['U', 'D', 'F', 'B', 'L', 'R'] as const;
export type FaceName = (typeof FACE_NAMES)[number];

export const FACE_NAME_TO_INDEX: Record<FaceName, FaceIndex> = {
  U: 0, D: 1, F: 2, B: 3, L: 4, R: 5,
};

// Each face is a 3x3 grid of colors (row-major, 0-8)
export type Face = FaceColor[];

// The full cube state: 6 faces
export type CubeState = [Face, Face, Face, Face, Face, Face];

// Standard move notation
export type Move =
  | 'U' | "U'" | 'U2'
  | 'D' | "D'" | 'D2'
  | 'F' | "F'" | 'F2'
  | 'B' | "B'" | 'B2'
  | 'L' | "L'" | 'L2'
  | 'R' | "R'" | 'R2';

export const ALL_MOVES: Move[] = [
  'U', "U'", 'U2', 'D', "D'", 'D2',
  'F', "F'", 'F2', 'B', "B'", 'B2',
  'L', "L'", 'L2', 'R', "R'", 'R2',
];

export interface SolveStep {
  move: Move;
  description: string;
  phase: string;
}

export const COLOR_MAP: Record<FaceColor, string> = {
  W: '#ffffff',
  Y: '#ffd500',
  R: '#b71234',
  O: '#ff5800',
  B: '#0046ad',
  G: '#009b48',
};

export const COLOR_LABEL: Record<FaceColor, string> = {
  W: 'White',
  Y: 'Yellow',
  R: 'Red',
  O: 'Orange',
  B: 'Blue',
  G: 'Green',
};

export type GameMode = 'guided' | 'challenge' | 'free';

export interface ChallengeResult {
  scrambleMoves: number;
  userMoves: number;
  optimalMoves: number;
  timeSeconds: number;
  solved: boolean;
}
