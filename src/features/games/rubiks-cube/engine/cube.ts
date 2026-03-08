import type { CubeState, Face, FaceColor, Move } from './types';

// Create a solved cube
export function createSolvedCube(): CubeState {
  const face = (c: FaceColor): Face => Array(9).fill(c);
  return [
    face('W'), // U - white
    face('Y'), // D - yellow
    face('R'), // F - red
    face('O'), // B - orange
    face('B'), // L - blue
    face('G'), // R - green
  ];
}

export function cloneCube(cube: CubeState): CubeState {
  return cube.map(f => [...f]) as CubeState;
}

export function isSolved(cube: CubeState): boolean {
  return cube.every(face => face.every(c => c === face[0]));
}

// Rotate a face 90° clockwise (indices only)
function rotateFaceCW(face: Face): Face {
  return [face[6], face[3], face[0], face[7], face[4], face[1], face[8], face[5], face[2]];
}

// Apply a single base move (quarter turn CW)
function applyBaseMoveU(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[0] = rotateFaceCW(s[0]);
  // Cycle: F->L->B->R->F (top rows)
  [c[2][0], c[2][1], c[2][2]] = [s[5][0], s[5][1], s[5][2]];
  [c[4][0], c[4][1], c[4][2]] = [s[2][0], s[2][1], s[2][2]];
  [c[3][0], c[3][1], c[3][2]] = [s[4][0], s[4][1], s[4][2]];
  [c[5][0], c[5][1], c[5][2]] = [s[3][0], s[3][1], s[3][2]];
  return c;
}

function applyBaseMoveD(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[1] = rotateFaceCW(s[1]);
  [c[2][6], c[2][7], c[2][8]] = [s[4][6], s[4][7], s[4][8]];
  [c[5][6], c[5][7], c[5][8]] = [s[2][6], s[2][7], s[2][8]];
  [c[3][6], c[3][7], c[3][8]] = [s[5][6], s[5][7], s[5][8]];
  [c[4][6], c[4][7], c[4][8]] = [s[3][6], s[3][7], s[3][8]];
  return c;
}

function applyBaseMoveF(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[2] = rotateFaceCW(s[2]);
  // U bottom row -> R left col -> D top row (reversed) -> L right col
  [c[5][0], c[5][3], c[5][6]] = [s[0][6], s[0][7], s[0][8]];
  [c[1][2], c[1][1], c[1][0]] = [s[5][0], s[5][3], s[5][6]];
  [c[4][8], c[4][5], c[4][2]] = [s[1][0], s[1][1], s[1][2]];
  [c[0][6], c[0][7], c[0][8]] = [s[4][8], s[4][5], s[4][2]];
  return c;
}

function applyBaseMoveB(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[3] = rotateFaceCW(s[3]);
  [c[4][0], c[4][3], c[4][6]] = [s[0][2], s[0][1], s[0][0]];
  [c[1][6], c[1][7], c[1][8]] = [s[4][0], s[4][3], s[4][6]];
  [c[5][8], c[5][5], c[5][2]] = [s[1][6], s[1][7], s[1][8]];
  [c[0][0], c[0][1], c[0][2]] = [s[5][2], s[5][5], s[5][8]];
  return c;
}

function applyBaseMoveL(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[4] = rotateFaceCW(s[4]);
  [c[2][0], c[2][3], c[2][6]] = [s[0][0], s[0][3], s[0][6]];
  [c[1][0], c[1][3], c[1][6]] = [s[2][0], s[2][3], s[2][6]];
  [c[3][8], c[3][5], c[3][2]] = [s[1][0], s[1][3], s[1][6]];
  [c[0][0], c[0][3], c[0][6]] = [s[3][8], s[3][5], s[3][2]];
  return c;
}

function applyBaseMoveR(s: CubeState): CubeState {
  const c = cloneCube(s);
  c[5] = rotateFaceCW(s[5]);
  [c[0][2], c[0][5], c[0][8]] = [s[2][2], s[2][5], s[2][8]];
  [c[3][6], c[3][3], c[3][0]] = [s[0][2], s[0][5], s[0][8]];
  [c[1][2], c[1][5], c[1][8]] = [s[3][6], s[3][3], s[3][0]];
  [c[2][2], c[2][5], c[2][8]] = [s[1][2], s[1][5], s[1][8]];
  return c;
}

const BASE_MOVES: Record<string, (s: CubeState) => CubeState> = {
  U: applyBaseMoveU,
  D: applyBaseMoveD,
  F: applyBaseMoveF,
  B: applyBaseMoveB,
  L: applyBaseMoveL,
  R: applyBaseMoveR,
};

export function applyMove(cube: CubeState, move: Move): CubeState {
  const face = move[0] as string;
  const modifier = move.slice(1);
  const fn = BASE_MOVES[face];
  if (!fn) return cube;

  if (modifier === '2') {
    return fn(fn(cube));
  } else if (modifier === "'") {
    return fn(fn(fn(cube)));
  }
  return fn(cube);
}

export function applyMoves(cube: CubeState, moves: Move[]): CubeState {
  return moves.reduce((c, m) => applyMove(c, m), cube);
}

export function invertMove(move: Move): Move {
  const face = move[0];
  const mod = move.slice(1);
  if (mod === '2') return move;
  if (mod === "'") return face as Move;
  return (face + "'") as Move;
}

// Generate a scramble sequence
export function generateScramble(length: number): Move[] {
  const faces = ['U', 'D', 'F', 'B', 'L', 'R'];
  const modifiers = ['', "'", '2'];
  const moves: Move[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    lastFace = face;
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push((face + mod) as Move);
  }
  return moves;
}

// Get face color at a specific position for rendering
export function getFaceColors(cube: CubeState, faceIndex: number): FaceColor[] {
  return [...cube[faceIndex]];
}
