import type { CubeState, Move, SolveStep } from './types';
import { createSolvedCube, applyMoves, isSolved } from './cube';
import { solveCube } from './pieceSolver';

// Phase labels for the 7-step layer-by-layer algorithm
const PHASE_LABELS = [
  'Front Cross',
  'Front Corners',
  'Second Layer',
  'Back Face Edges',
  'Last Layer Corner Position',
  'Last Layer Corner Orientation',
  'Last Layer Edges',
];

function getPhaseForProgress(pct: number): string {
  if (pct <= 14) return PHASE_LABELS[0];
  if (pct <= 28) return PHASE_LABELS[1];
  if (pct <= 42) return PHASE_LABELS[2];
  if (pct <= 56) return PHASE_LABELS[3];
  if (pct <= 70) return PHASE_LABELS[4];
  if (pct <= 85) return PHASE_LABELS[5];
  return PHASE_LABELS[6];
}

function describeMoveAction(move: Move): string {
  const faceNames: Record<string, string> = {
    U: 'Top', D: 'Bottom', F: 'Front', B: 'Back', L: 'Left', R: 'Right',
  };
  const face = faceNames[move[0]] || move[0];
  const mod = move.slice(1);
  const dir = mod === "'" ? 'counter-clockwise' : mod === '2' ? '180°' : 'clockwise';
  return `Rotate the ${face} face ${dir}`;
}

// Solve from a known move history by reconstructing the cube state and solving it
export function solveFromMoves(moveHistory: Move[]): SolveStep[] {
  if (moveHistory.length === 0) return [];

  const cubeState = applyMoves(createSolvedCube(), moveHistory);
  return solveCubeState(cubeState);
}

// Solve any arbitrary cube state using the layer-by-layer algorithm
export function solveCubeState(cubeState: CubeState): SolveStep[] {
  if (isSolved(cubeState)) return [];

  const moves = solveCube(cubeState);
  if (moves.length === 0) return [];

  const total = moves.length;
  return moves.map((move, idx) => {
    const pct = Math.round(((idx + 1) / total) * 100);
    return {
      move,
      description: `Step ${idx + 1}/${total}: ${describeMoveAction(move)}`,
      phase: getPhaseForProgress(pct),
    };
  });
}

// Convenience wrapper used by the hook — now solves from actual cube state
export function generateGuidedSteps(moveHistory: Move[]): SolveStep[] {
  return solveFromMoves(moveHistory);
}
