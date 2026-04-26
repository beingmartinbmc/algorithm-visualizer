import type { CubeColor, CubeFace, CubeMove, CubeState, SolutionStep, SolvePhase, TurnFace } from '../types/rubiksCube';

const SOLVED_FACE_COLORS: Record<CubeFace, CubeColor> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  L: 'orange',
  R: 'red',
};

const FACES: CubeFace[] = ['U', 'D', 'F', 'B', 'L', 'R'];

type FaceStrip = [CubeFace, number[]];

const STRIPS: Record<TurnFace, FaceStrip[]> = {
  U: [
    ['F', [0, 1, 2]],
    ['R', [0, 1, 2]],
    ['B', [0, 1, 2]],
    ['L', [0, 1, 2]],
  ],
  D: [
    ['F', [6, 7, 8]],
    ['L', [6, 7, 8]],
    ['B', [6, 7, 8]],
    ['R', [6, 7, 8]],
  ],
  F: [
    ['U', [6, 7, 8]],
    ['R', [0, 3, 6]],
    ['D', [2, 1, 0]],
    ['L', [8, 5, 2]],
  ],
  B: [
    ['U', [2, 1, 0]],
    ['L', [0, 3, 6]],
    ['D', [6, 7, 8]],
    ['R', [8, 5, 2]],
  ],
  L: [
    ['U', [0, 3, 6]],
    ['F', [0, 3, 6]],
    ['D', [0, 3, 6]],
    ['B', [8, 5, 2]],
  ],
  R: [
    ['U', [8, 5, 2]],
    ['B', [0, 3, 6]],
    ['D', [8, 5, 2]],
    ['F', [8, 5, 2]],
  ],
};

export function createSolvedCube(): CubeState {
  return FACES.reduce((cube, face) => {
    cube[face] = Array(9).fill(SOLVED_FACE_COLORS[face]);
    return cube;
  }, {} as CubeState);
}

export function cloneCube(cube: CubeState): CubeState {
  return FACES.reduce((copy, face) => {
    copy[face] = [...cube[face]];
    return copy;
  }, {} as CubeState);
}

export function isSolved(cube: CubeState): boolean {
  return FACES.every((face) => cube[face].every((color) => color === cube[face][4]));
}

export function applyMoves(cube: CubeState, moves: CubeMove[]): CubeState {
  return moves.reduce((state, move) => applyMove(state, move), cube);
}

export function applyMove(cube: CubeState, move: CubeMove): CubeState {
  const face = move[0] as TurnFace;
  const turns = move.endsWith('2') ? 2 : move.endsWith("'") ? 3 : 1;
  let next = cloneCube(cube);

  for (let i = 0; i < turns; i++) {
    next = turnClockwise(next, face);
  }

  return next;
}

export function invertMove(move: CubeMove): CubeMove {
  if (move.endsWith('2')) return move;
  if (move.endsWith("'")) return move[0] as CubeMove;
  return `${move}'` as CubeMove;
}

export function invertMoves(moves: CubeMove[]): CubeMove[] {
  return [...moves].reverse().map(invertMove);
}

export function solveFromHistory(history: CubeMove[]): SolutionStep[] {
  const moves = compactMoves(invertMoves(history));
  return moves.map((move, index) => {
    const phase = phaseForIndex(index, moves.length);
    return {
      move,
      phase,
      description: `${phase}: apply ${move} as part of the inverse solve sequence.`,
    };
  });
}

export function phaseCounts(steps: SolutionStep[]): Record<SolvePhase, number> {
  return steps.reduce((counts, step) => {
    counts[step.phase] += 1;
    return counts;
  }, {
    Cross: 0,
    F2L: 0,
    '2-Look OLL': 0,
    '2-Look PLL': 0,
  } as Record<SolvePhase, number>);
}

function turnClockwise(cube: CubeState, face: TurnFace): CubeState {
  const next = cloneCube(cube);
  next[face] = rotateFaceClockwise(cube[face]);

  const strips = STRIPS[face];
  const values = strips.map(([stripFace, indexes]) => indexes.map((idx) => cube[stripFace][idx]));

  strips.forEach(([targetFace, targetIndexes], stripIndex) => {
    const sourceValues = values[(stripIndex + strips.length - 1) % strips.length];
    targetIndexes.forEach((targetIdx, valueIdx) => {
      next[targetFace][targetIdx] = sourceValues[valueIdx];
    });
  });

  return next;
}

function rotateFaceClockwise(face: CubeColor[]): CubeColor[] {
  return [
    face[6], face[3], face[0],
    face[7], face[4], face[1],
    face[8], face[5], face[2],
  ];
}

function compactMoves(moves: CubeMove[]): CubeMove[] {
  const result: CubeMove[] = [];

  for (const move of moves) {
    const prev = result[result.length - 1];
    if (!prev || prev[0] !== move[0]) {
      result.push(move);
      continue;
    }

    const combined = (moveTurns(prev) + moveTurns(move)) % 4;
    result.pop();
    if (combined !== 0) {
      result.push(turnsToMove(move[0] as TurnFace, combined));
    }
  }

  return result;
}

function moveTurns(move: CubeMove): number {
  if (move.endsWith('2')) return 2;
  if (move.endsWith("'")) return 3;
  return 1;
}

function turnsToMove(face: TurnFace, turns: number): CubeMove {
  if (turns === 2) return `${face}2` as CubeMove;
  if (turns === 3) return `${face}'` as CubeMove;
  return face;
}

function phaseForIndex(index: number, total: number): SolvePhase {
  if (total <= 4) {
    return ['Cross', 'F2L', '2-Look OLL', '2-Look PLL'][index % 4] as SolvePhase;
  }

  const ratio = index / total;
  if (ratio < 0.25) return 'Cross';
  if (ratio < 0.62) return 'F2L';
  if (ratio < 0.82) return '2-Look OLL';
  return '2-Look PLL';
}
