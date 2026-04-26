import type { Challenge, CubeMove, SimulationResult } from '../types/rubiksCube';
import { ALL_MOVES } from '../types/rubiksCube';
import { solveFromHistory } from './cube';

const FACES = ['U', 'D', 'F', 'B', 'L', 'R'];

export const CHALLENGES: Challenge[] = [
  {
    id: 'starter-cross',
    title: 'Starter Scramble',
    description: 'A short scramble for practicing move notation and inverse solving.',
    scramble: ['R', 'U', "R'", "U'"],
    targetMoves: 4,
  },
  {
    id: 'six-move',
    title: 'Six Move Sprint',
    description: 'Solve a slightly longer scramble with clean inverse turns.',
    scramble: ['F', 'R', 'U', "R'", "U'", "F'"],
    targetMoves: 6,
  },
  {
    id: 'middle-layer',
    title: 'Middle Layer Drill',
    description: 'A medium scramble that touches side faces and top-layer turns.',
    scramble: ['L', 'U2', 'F', "R'", 'D', 'B2', "L'"],
    targetMoves: 7,
  },
  {
    id: 'full-cube',
    title: 'Full Cube Challenge',
    description: 'A longer scramble that rewards using the solver and reading move notation.',
    scramble: ['R', 'U', 'F2', "L'", 'D', 'B', 'R2', "U'", 'F', "D'"],
    targetMoves: 10,
  },
];

export function generateScramble(length: number): CubeMove[] {
  const scramble: CubeMove[] = [];
  let previousFace = '';

  while (scramble.length < length) {
    const move = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
    const face = move[0];
    if (face === previousFace) continue;
    scramble.push(move);
    previousFace = face;
  }

  return scramble;
}

export function formatMoves(moves: CubeMove[]): string {
  return moves.length > 0 ? moves.join(' ') : 'None';
}

export function parseMove(input: string): CubeMove | null {
  const normalized = input.trim().toUpperCase().replace('’', "'").replace(/I$/, "'");
  if (!normalized) return null;

  const face = normalized[0];
  const suffix = normalized.slice(1);
  if (!FACES.includes(face)) return null;
  if (suffix !== '' && suffix !== "'" && suffix !== '2') return null;

  return `${face}${suffix}` as CubeMove;
}

export function parseMoveSequence(input: string): CubeMove[] | null {
  const tokens = input
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return null;

  const parsed = tokens.map(parseMove);
  if (parsed.some((move) => move === null)) return null;

  return parsed as CubeMove[];
}

export function runSimulation(runs: number, scrambleLength = 25): SimulationResult {
  const normalizedRuns = Math.max(1, Math.min(runs, 100));
  const samples = Array.from({ length: normalizedRuns }, () => {
    const scramble = generateScramble(scrambleLength);
    return {
      scramble,
      solutionLength: solveFromHistory(scramble).length,
    };
  });

  const best = samples.reduce((currentBest, sample) => (
    sample.solutionLength < currentBest.solutionLength ? sample : currentBest
  ), samples[0]);
  const worst = samples.reduce((currentWorst, sample) => (
    sample.solutionLength > currentWorst.solutionLength ? sample : currentWorst
  ), samples[0]);
  const averageLength = samples.reduce((sum, sample) => sum + sample.solutionLength, 0) / samples.length;

  return {
    runs: normalizedRuns,
    best,
    worst,
    averageLength,
  };
}
