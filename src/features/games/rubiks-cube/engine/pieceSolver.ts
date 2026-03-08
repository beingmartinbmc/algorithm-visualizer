// Ported from https://github.com/pglass/cube (MIT License)
// A layer-by-layer Rubik's Cube solver using piece-based representation

import type { CubeState, Move } from './types';

// ============================================================================
// Point - 3D integer vector
// ============================================================================
class Point {
  x: number;
  y: number;
  z: number;

  constructor(x: number | Point, y?: number, z?: number) {
    if (x instanceof Point) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else {
      this.x = x;
      this.y = y!;
      this.z = z!;
    }
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  mul(scalar: number): Point {
    return new Point(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other: Point): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Point): Point {
    return new Point(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }

  get(i: number): number {
    if (i === 0) return this.x;
    if (i === 1) return this.y;
    if (i === 2) return this.z;
    throw new Error('Point index out of range');
  }

  set(i: number, val: number): void {
    if (i === 0) this.x = val;
    else if (i === 1) this.y = val;
    else if (i === 2) this.z = val;
    else throw new Error('Point index out of range');
  }

  countVal(val: number): number {
    return (this.x === val ? 1 : 0) + (this.y === val ? 1 : 0) + (this.z === val ? 1 : 0);
  }

  eq(other: Point): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  any(): boolean {
    return this.x !== 0 || this.y !== 0 || this.z !== 0;
  }

  clone(): Point {
    return new Point(this.x, this.y, this.z);
  }

  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}

// ============================================================================
// Matrix - 3x3 matrix
// ============================================================================
class Matrix {
  vals: number[];

  constructor(...args: number[]) {
    if (args.length === 9) {
      this.vals = [...args];
    } else {
      throw new Error('Matrix requires exactly 9 values');
    }
  }

  row(i: number): Point {
    const base = i * 3;
    return new Point(this.vals[base], this.vals[base + 1], this.vals[base + 2]);
  }

  col(i: number): Point {
    return new Point(this.vals[i], this.vals[i + 3], this.vals[i + 6]);
  }

  mulPoint(p: Point): Point {
    return new Point(
      this.row(0).dot(p),
      this.row(1).dot(p),
      this.row(2).dot(p),
    );
  }
}

// ============================================================================
// Constants
// ============================================================================
const RIGHT = new Point(1, 0, 0);
const LEFT = new Point(-1, 0, 0);
const UP = new Point(0, 1, 0);
const DOWN = new Point(0, -1, 0);
const FRONT = new Point(0, 0, 1);
const BACK = new Point(0, 0, -1);

const X_AXIS = new Point(1, 0, 0);
const Y_AXIS = new Point(0, 1, 0);
const Z_AXIS = new Point(0, 0, 1);

const FACE = 'face';
const EDGE = 'edge';
const CORNER = 'corner';

// 90 degree rotation matrices
const ROT_XY_CW = new Matrix(0, 1, 0, -1, 0, 0, 0, 0, 1);
const ROT_XY_CC = new Matrix(0, -1, 0, 1, 0, 0, 0, 0, 1);
const ROT_XZ_CW = new Matrix(0, 0, -1, 0, 1, 0, 1, 0, 0);
const ROT_XZ_CC = new Matrix(0, 0, 1, 0, 1, 0, -1, 0, 0);
const ROT_YZ_CW = new Matrix(1, 0, 0, 0, 0, 1, 0, -1, 0);
const ROT_YZ_CC = new Matrix(1, 0, 0, 0, 0, -1, 0, 1, 0);

function getRotFromFace(face: Point): [string, string] | null {
  if (face.eq(RIGHT)) return ['R', 'Ri'];
  if (face.eq(LEFT)) return ['L', 'Li'];
  if (face.eq(UP)) return ['U', 'Ui'];
  if (face.eq(DOWN)) return ['D', 'Di'];
  if (face.eq(FRONT)) return ['F', 'Fi'];
  if (face.eq(BACK)) return ['B', 'Bi'];
  return null;
}

// ============================================================================
// Piece
// ============================================================================
class Piece {
  pos: Point;
  colors: (string | null)[];
  type: string;

  constructor(pos: Point, colors: (string | null)[]) {
    this.pos = pos;
    this.colors = [...colors];
    this.type = this._getType();
  }

  private _getType(): string {
    const nullCount = this.colors.filter(c => c === null).length;
    if (nullCount === 2) return FACE;
    if (nullCount === 1) return EDGE;
    if (nullCount === 0) return CORNER;
    throw new Error(`Invalid colors: ${this.colors}`);
  }

  rotate(matrix: Matrix): void {
    const before = this.pos.clone();
    this.pos = matrix.mulPoint(this.pos);

    let rot = this.pos.sub(before);
    if (!rot.any()) return;
    if (rot.countVal(0) === 2) {
      rot = rot.add(matrix.mulPoint(rot));
    }

    if (rot.countVal(0) !== 1) {
      throw new Error(`Bug in Piece.rotate! before=${before} pos=${this.pos} rot=${rot}`);
    }

    const indices: number[] = [];
    for (let i = 0; i < 3; i++) {
      if (rot.get(i) !== 0) indices.push(i);
    }
    const [a, b] = indices;
    const tmp = this.colors[a];
    this.colors[a] = this.colors[b];
    this.colors[b] = tmp;
  }

  clone(): Piece {
    return new Piece(this.pos.clone(), [...this.colors]);
  }
}

// ============================================================================
// PieceCube
// ============================================================================
class PieceCube {
  faces: Piece[];
  edges: Piece[];
  corners: Piece[];
  pieces: Piece[];

  constructor(source: string | PieceCube) {
    if (source instanceof PieceCube) {
      this.faces = source.faces.map(p => p.clone());
      this.edges = source.edges.map(p => p.clone());
      this.corners = source.corners.map(p => p.clone());
      this.pieces = [...this.faces, ...this.edges, ...this.corners];
      return;
    }

    const s = source.replace(/\s/g, '');
    if (s.length !== 54) throw new Error(`Cube string must be 54 characters, got ${s.length}`);

    this.faces = [
      new Piece(RIGHT, [s[28], null, null]),
      new Piece(LEFT, [s[22], null, null]),
      new Piece(UP, [null, s[4], null]),
      new Piece(DOWN, [null, s[49], null]),
      new Piece(FRONT, [null, null, s[25]]),
      new Piece(BACK, [null, null, s[31]]),
    ];

    this.edges = [
      new Piece(RIGHT.add(UP), [s[16], s[5], null]),
      new Piece(RIGHT.add(DOWN), [s[40], s[50], null]),
      new Piece(RIGHT.add(FRONT), [s[27], null, s[26]]),
      new Piece(RIGHT.add(BACK), [s[29], null, s[30]]),
      new Piece(LEFT.add(UP), [s[10], s[3], null]),
      new Piece(LEFT.add(DOWN), [s[34], s[48], null]),
      new Piece(LEFT.add(FRONT), [s[23], null, s[24]]),
      new Piece(LEFT.add(BACK), [s[21], null, s[32]]),
      new Piece(UP.add(FRONT), [null, s[7], s[13]]),
      new Piece(UP.add(BACK), [null, s[1], s[19]]),
      new Piece(DOWN.add(FRONT), [null, s[46], s[37]]),
      new Piece(DOWN.add(BACK), [null, s[52], s[43]]),
    ];

    this.corners = [
      new Piece(RIGHT.add(UP).add(FRONT), [s[15], s[8], s[14]]),
      new Piece(RIGHT.add(UP).add(BACK), [s[17], s[2], s[18]]),
      new Piece(RIGHT.add(DOWN).add(FRONT), [s[39], s[47], s[38]]),
      new Piece(RIGHT.add(DOWN).add(BACK), [s[41], s[53], s[42]]),
      new Piece(LEFT.add(UP).add(FRONT), [s[11], s[6], s[12]]),
      new Piece(LEFT.add(UP).add(BACK), [s[9], s[0], s[20]]),
      new Piece(LEFT.add(DOWN).add(FRONT), [s[35], s[45], s[36]]),
      new Piece(LEFT.add(DOWN).add(BACK), [s[33], s[51], s[44]]),
    ];

    this.pieces = [...this.faces, ...this.edges, ...this.corners];
  }

  isSolved(): boolean {
    const check = (colors: (string | null)[]) => colors.every(c => c === colors[0]);
    return (
      check(this._face(FRONT).map(p => p.colors[2])) &&
      check(this._face(BACK).map(p => p.colors[2])) &&
      check(this._face(UP).map(p => p.colors[1])) &&
      check(this._face(DOWN).map(p => p.colors[1])) &&
      check(this._face(LEFT).map(p => p.colors[0])) &&
      check(this._face(RIGHT).map(p => p.colors[0]))
    );
  }

  _face(axis: Point): Piece[] {
    return this.pieces.filter(p => p.pos.dot(axis) > 0);
  }

  _slice(plane: Point): Piece[] {
    const i = [0, 1, 2].find(idx => plane.get(idx) === 0)!;
    return this.pieces.filter(p => p.pos.get(i) === 0);
  }

  _rotateFace(face: Point, matrix: Matrix): void {
    this._rotatePieces(this._face(face), matrix);
  }

  _rotateSlice(plane: Point, matrix: Matrix): void {
    this._rotatePieces(this._slice(plane), matrix);
  }

  _rotatePieces(pieces: Piece[], matrix: Matrix): void {
    for (const piece of pieces) {
      piece.rotate(matrix);
    }
  }

  // Standard moves
  L(): void { this._rotateFace(LEFT, ROT_YZ_CC); }
  Li(): void { this._rotateFace(LEFT, ROT_YZ_CW); }
  R(): void { this._rotateFace(RIGHT, ROT_YZ_CW); }
  Ri(): void { this._rotateFace(RIGHT, ROT_YZ_CC); }
  U(): void { this._rotateFace(UP, ROT_XZ_CW); }
  Ui(): void { this._rotateFace(UP, ROT_XZ_CC); }
  D(): void { this._rotateFace(DOWN, ROT_XZ_CC); }
  Di(): void { this._rotateFace(DOWN, ROT_XZ_CW); }
  F(): void { this._rotateFace(FRONT, ROT_XY_CW); }
  Fi(): void { this._rotateFace(FRONT, ROT_XY_CC); }
  B(): void { this._rotateFace(BACK, ROT_XY_CC); }
  Bi(): void { this._rotateFace(BACK, ROT_XY_CW); }

  // Slice moves
  M(): void { this._rotateSlice(Y_AXIS.add(Z_AXIS), ROT_YZ_CC); }
  Mi(): void { this._rotateSlice(Y_AXIS.add(Z_AXIS), ROT_YZ_CW); }
  E(): void { this._rotateSlice(X_AXIS.add(Z_AXIS), ROT_XZ_CC); }
  Ei(): void { this._rotateSlice(X_AXIS.add(Z_AXIS), ROT_XZ_CW); }
  S(): void { this._rotateSlice(X_AXIS.add(Y_AXIS), ROT_XY_CW); }
  Si(): void { this._rotateSlice(X_AXIS.add(Y_AXIS), ROT_XY_CC); }

  // Whole cube rotations
  X(): void { this._rotatePieces(this.pieces, ROT_YZ_CW); }
  Xi(): void { this._rotatePieces(this.pieces, ROT_YZ_CC); }
  Y(): void { this._rotatePieces(this.pieces, ROT_XZ_CW); }
  Yi(): void { this._rotatePieces(this.pieces, ROT_XZ_CC); }
  Z(): void { this._rotatePieces(this.pieces, ROT_XY_CW); }
  Zi(): void { this._rotatePieces(this.pieces, ROT_XY_CC); }

  sequence(moveStr: string): void {
    const names = moveStr.split(/\s+/).filter(Boolean);
    for (const name of names) {
      const fn = (this as unknown as Record<string, () => void>)[name];
      if (!fn) throw new Error(`Unknown move: ${name}`);
      fn.call(this);
    }
  }

  findPiece(...colors: (string | null)[]): Piece | undefined {
    const realColors = colors.filter(c => c !== null) as string[];
    for (const p of this.pieces) {
      if (p.colors.filter(c => c === null).length === 3 - realColors.length &&
          realColors.every(c => p.colors.includes(c))) {
        return p;
      }
    }
    return undefined;
  }

  getPiece(x: number, y: number, z: number): Piece | undefined {
    const target = new Point(x, y, z);
    return this.pieces.find(p => p.pos.eq(target));
  }

  getColors(): Set<string> {
    const result = new Set<string>();
    for (const piece of this.pieces) {
      for (const c of piece.colors) {
        if (c !== null) result.add(c);
      }
    }
    return result;
  }

  leftColor(): string { return this.getPiece(-1, 0, 0)!.colors[0]!; }
  rightColor(): string { return this.getPiece(1, 0, 0)!.colors[0]!; }
  upColor(): string { return this.getPiece(0, 1, 0)!.colors[1]!; }
  downColor(): string { return this.getPiece(0, -1, 0)!.colors[1]!; }
  frontColor(): string { return this.getPiece(0, 0, 1)!.colors[2]!; }
  backColor(): string { return this.getPiece(0, 0, -1)!.colors[2]!; }
}

// ============================================================================
// Optimizer (from pglass/cube optimize.py)
// ============================================================================
const X_ROT_CW: Record<string, string> = {
  U: 'F', B: 'U', D: 'B', F: 'D', E: 'Si', S: 'E', Y: 'Z', Z: 'Yi',
};
const Y_ROT_CW: Record<string, string> = {
  B: 'L', R: 'B', F: 'R', L: 'F', S: 'Mi', M: 'S', Z: 'X', X: 'Zi',
};
const Z_ROT_CW: Record<string, string> = {
  U: 'L', R: 'U', D: 'R', L: 'D', E: 'Mi', M: 'E', Y: 'Xi', X: 'Y',
};

function invertNotation(move: string): string {
  if (move.endsWith('i')) return move.slice(0, -1);
  return move + 'i';
}

function getRotTable(rot: string): Record<string, string> | null {
  const X_ROT_CC = Object.fromEntries(Object.entries(X_ROT_CW).map(([k, v]) => [v, k]));
  const Y_ROT_CC = Object.fromEntries(Object.entries(Y_ROT_CW).map(([k, v]) => [v, k]));
  const Z_ROT_CC = Object.fromEntries(Object.entries(Z_ROT_CW).map(([k, v]) => [v, k]));

  if (rot === 'X') return X_ROT_CW;
  if (rot === 'Xi') return X_ROT_CC;
  if (rot === 'Y') return Y_ROT_CW;
  if (rot === 'Yi') return Y_ROT_CC;
  if (rot === 'Z') return Z_ROT_CW;
  if (rot === 'Zi') return Z_ROT_CC;
  return null;
}

function unrotate(rot: string, moves: string[]): string[] {
  const rotTable = getRotTable(rot);
  if (!rotTable) return moves;
  return moves.map(move => {
    if (move in rotTable) return rotTable[move];
    const inv = invertNotation(move);
    if (inv in rotTable) return invertNotation(rotTable[inv]);
    return move;
  });
}

function applyRepeatThreeOptimization(moves: string[]): void {
  let changed = true;
  while (changed) {
    changed = false;
    let i = 0;
    while (i < moves.length - 2) {
      if (moves[i] === moves[i + 1] && moves[i + 1] === moves[i + 2]) {
        moves.splice(i, 3, invertNotation(moves[i]));
        changed = true;
      } else {
        i++;
      }
    }
  }
}

function applyDoUndoOptimization(moves: string[]): void {
  let changed = true;
  while (changed) {
    changed = false;
    let i = 0;
    while (i < moves.length - 1) {
      if (invertNotation(moves[i]) === moves[i + 1]) {
        moves.splice(i, 2);
        changed = true;
      } else {
        i++;
      }
    }
  }
}

function applyNoFullCubeRotationOptimization(moves: string[]): void {
  const rots = new Set(['X', 'Y', 'Z', 'Xi', 'Yi', 'Zi']);
  let changed = true;
  while (changed) {
    changed = false;
    let i = 0;
    while (i < moves.length) {
      if (!rots.has(moves[i])) {
        i++;
        continue;
      }
      for (let j = moves.length - 1; j > i; j--) {
        if (moves[j] === invertNotation(moves[i])) {
          const inner = moves.slice(i + 1, j);
          const unrotated = unrotate(moves[i], inner);
          moves.splice(i, j - i + 1, ...unrotated);
          changed = true;
          break;
        }
      }
      i++;
    }
  }
}

function optimizeMoveList(moves: string[]): string[] {
  const result = [...moves];
  applyNoFullCubeRotationOptimization(result);
  applyRepeatThreeOptimization(result);
  applyDoUndoOptimization(result);
  return result;
}

// ============================================================================
// Solver (from pglass/cube solve.py)
// ============================================================================
class Solver {
  cube: PieceCube;
  moves: string[];
  private infiniteLoopMax = 12;

  constructor(cube: PieceCube) {
    this.cube = cube;
    this.moves = [];
  }

  solve(): void {
    this.cross();
    this.crossCorners();
    this.secondLayer();
    this.backFaceEdges();
    this.lastLayerCornersPosition();
    this.lastLayerCornersOrientation();
    this.lastLayerEdges();
  }

  private move(moveStr: string): void {
    this.moves.push(...moveStr.split(/\s+/).filter(Boolean));
    this.cube.sequence(moveStr);
  }

  // Phase 1: Front face cross
  private cross(): void {
    const flPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor())!;
    const frPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor())!;
    const fuPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.upColor())!;
    const fdPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.downColor())!;

    const leftPiece = this.cube.findPiece(this.cube.leftColor())!;
    const rightPiece = this.cube.findPiece(this.cube.rightColor())!;
    const upPiece = this.cube.findPiece(this.cube.upColor())!;
    const downPiece = this.cube.findPiece(this.cube.downColor())!;

    this._crossLeftOrRight(flPiece, leftPiece, this.cube.leftColor(), 'L L', 'E L Ei Li');
    this._crossLeftOrRight(frPiece, rightPiece, this.cube.rightColor(), 'R R', 'Ei R E Ri');

    this.move('Z');
    this._crossLeftOrRight(fdPiece, downPiece, this.cube.leftColor(), 'L L', 'E L Ei Li');
    this._crossLeftOrRight(fuPiece, upPiece, this.cube.rightColor(), 'R R', 'Ei R E Ri');
    this.move('Zi');
  }

  private _crossLeftOrRight(
    edgePiece: Piece, facePiece: Piece, faceColor: string,
    move1: string, move2: string,
  ): void {
    if (edgePiece.pos.x === facePiece.pos.x &&
        edgePiece.pos.y === facePiece.pos.y &&
        edgePiece.pos.z === 1 &&
        edgePiece.colors[2] === this.cube.frontColor()) {
      return;
    }

    let undoMove: string | null = null;

    if (edgePiece.pos.z === 0) {
      // piece is in the middle layer; pick the UP or DOWN face to rotate
      const pp = edgePiece.pos.clone();
      pp.x = 0;
      const rot = getRotFromFace(pp);
      if (rot) {
        const [cw, cc] = rot;
        if (edgePiece.pos.eq(LEFT.add(UP)) || edgePiece.pos.eq(RIGHT.add(DOWN))) {
          this.move(cw);
          undoMove = cc;
        } else {
          this.move(cc);
          undoMove = cw;
        }
      }
    } else if (edgePiece.pos.z === 1) {
      const pp = edgePiece.pos.clone();
      pp.z = 0;
      const rot = getRotFromFace(pp);
      if (rot) {
        const [cw, cc] = rot;
        this.move(`${cc} ${cc}`);
        if (edgePiece.pos.x !== facePiece.pos.x) {
          undoMove = `${cw} ${cw}`;
        }
      }
    }

    // piece should be at z = -1
    let count = 0;
    while (edgePiece.pos.x !== facePiece.pos.x || edgePiece.pos.y !== facePiece.pos.y) {
      this.move('B');
      count++;
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in cross loop');
      }
    }

    if (undoMove) {
      this.move(undoMove);
    }

    if (edgePiece.colors[0] === faceColor) {
      this.move(move1);
    } else {
      this.move(move2);
    }
  }

  // Phase 2: Front face corners
  private crossCorners(): void {
    const fldPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor(), this.cube.downColor())!;
    const fluPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor(), this.cube.upColor())!;
    const frdPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor(), this.cube.downColor())!;
    const fruPiece = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor(), this.cube.upColor())!;

    const rightPiece = this.cube.findPiece(this.cube.rightColor())!;
    const leftPiece = this.cube.findPiece(this.cube.leftColor())!;
    const upPiece = this.cube.findPiece(this.cube.upColor())!;
    const downPiece = this.cube.findPiece(this.cube.downColor())!;

    this._placeFrdCorner(frdPiece, rightPiece, downPiece, this.cube.frontColor());
    this.move('Z');
    this._placeFrdCorner(fruPiece, upPiece, rightPiece, this.cube.frontColor());
    this.move('Z');
    this._placeFrdCorner(fluPiece, leftPiece, upPiece, this.cube.frontColor());
    this.move('Z');
    this._placeFrdCorner(fldPiece, downPiece, leftPiece, this.cube.frontColor());
    this.move('Z');
  }

  private _placeFrdCorner(
    cornerPiece: Piece, rightPiece: Piece, downPiece: Piece, frontColor: string,
  ): void {
    // rotate to z = -1
    if (cornerPiece.pos.z === 1) {
      const pp = new Point(0, cornerPiece.pos.y, 0);
      const rot = getRotFromFace(pp);
      if (rot) {
        const [cw, cc] = rot;
        let count = 0;
        let undoMove = cc;
        while ((cornerPiece.pos.z as number) !== -1) {
          this.move(cw);
          count++;
          if (count > 4) break;
        }
        if (count > 1) {
          for (let k = 0; k < count; k++) this.move(cc);
          count = 0;
          while ((cornerPiece.pos.z as number) !== -1) {
            this.move(cc);
            count++;
            if (count > 4) break;
          }
          undoMove = cw;
        }
        this.move('B');
        for (let k = 0; k < count; k++) this.move(undoMove);
      }
    }

    // rotate piece to be directly below its destination
    let count = 0;
    while (cornerPiece.pos.x !== rightPiece.pos.x || cornerPiece.pos.y !== downPiece.pos.y) {
      this.move('B');
      count++;
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in crossCorners loop');
      }
    }

    // three possible orientations
    if (cornerPiece.colors[0] === frontColor) {
      this.move('B D Bi Di');
    } else if (cornerPiece.colors[1] === frontColor) {
      this.move('Bi Ri B R');
    } else {
      this.move('Ri B B R Bi Bi D Bi Di');
    }
  }

  // Phase 3: Second (middle) layer
  private secondLayer(): void {
    const rdPiece = this.cube.findPiece(this.cube.rightColor(), this.cube.downColor())!;
    const ruPiece = this.cube.findPiece(this.cube.rightColor(), this.cube.upColor())!;
    const ldPiece = this.cube.findPiece(this.cube.leftColor(), this.cube.downColor())!;
    const luPiece = this.cube.findPiece(this.cube.leftColor(), this.cube.upColor())!;

    this._placeMiddleLayerLdEdge(ldPiece, this.cube.leftColor(), this.cube.downColor());
    this.move('Z');
    this._placeMiddleLayerLdEdge(rdPiece, this.cube.leftColor(), this.cube.downColor());
    this.move('Z');
    this._placeMiddleLayerLdEdge(ruPiece, this.cube.leftColor(), this.cube.downColor());
    this.move('Z');
    this._placeMiddleLayerLdEdge(luPiece, this.cube.leftColor(), this.cube.downColor());
    this.move('Z');
  }

  private _placeMiddleLayerLdEdge(ldPiece: Piece, leftColor: string, downColor: string): void {
    // move to z == -1
    if (ldPiece.pos.z === 0) {
      let count = 0;
      while ((ldPiece.pos.x as number) !== -1 || (ldPiece.pos.y as number) !== -1) {
        this.move('Z');
        count++;
        if (count > 4) break;
      }
      this.move('B L Bi Li Bi Di B D');
      for (let k = 0; k < count; k++) this.move('Zi');
    }

    if ((ldPiece.pos.z as number) === -1) {
      if (ldPiece.colors[2] === leftColor) {
        let count = 0;
        while ((ldPiece.pos.y as number) !== -1) {
          this.move('B');
          count++;
          if (count >= this.infiniteLoopMax) throw new Error('Stuck in secondLayer loop');
        }
        this.move('B L Bi Li Bi Di B D');
      } else if (ldPiece.colors[2] === downColor) {
        let count = 0;
        while ((ldPiece.pos.x as number) !== -1) {
          this.move('B');
          count++;
          if (count >= this.infiniteLoopMax) throw new Error('Stuck in secondLayer loop');
        }
        this.move('Bi Di B D B L Bi Li');
      }
    }
  }

  // Phase 4: Back face edges (last layer edge orientation)
  private backFaceEdges(): void {
    this.move('X X');

    const state1 = (): boolean => {
      return (
        this.cube.getPiece(0, 1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 0, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(0, -1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(1, 0, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const state2 = (): boolean => {
      return (
        this.cube.getPiece(0, 1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 0, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const state3 = (): boolean => {
      return (
        this.cube.getPiece(-1, 0, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(1, 0, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const state4 = (): boolean => {
      return (
        this.cube.getPiece(0, 1, 1)!.colors[2] !== this.cube.frontColor() &&
        this.cube.getPiece(-1, 0, 1)!.colors[2] !== this.cube.frontColor() &&
        this.cube.getPiece(0, -1, 1)!.colors[2] !== this.cube.frontColor() &&
        this.cube.getPiece(1, 0, 1)!.colors[2] !== this.cube.frontColor()
      );
    };

    let count = 0;
    while (!state1()) {
      if (state4() || state2()) {
        this.move('D F R Fi Ri Di');
      } else if (state3()) {
        this.move('D R F Ri Fi Di');
      } else {
        this.move('F');
      }
      count++;
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in backFaceEdges loop');
      }
    }

    this.move('Xi Xi');
  }

  // Phase 5: Last layer corners position
  private lastLayerCornersPosition(): void {
    this.move('X X');

    const move1 = 'Li Fi L D F Di Li F L F F';
    const move2 = 'F Li Fi L D F Di Li F L F';

    const c2 = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor(), this.cube.downColor())!;
    const c3 = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor(), this.cube.upColor())!;
    const c4 = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor(), this.cube.upColor())!;

    // place corner 4
    if (c4.pos.eq(new Point(1, -1, 1))) {
      this.move(`${move1} Zi ${move1} Z`);
    } else if (c4.pos.eq(new Point(1, 1, 1))) {
      this.move(`Z ${move2} Zi`);
    } else if (c4.pos.eq(new Point(-1, -1, 1))) {
      this.move(`Zi ${move1} Z`);
    }

    // place corner 2
    if (c2.pos.eq(new Point(1, 1, 1))) {
      this.move(`${move2} ${move1}`);
    } else if (c2.pos.eq(new Point(1, -1, 1))) {
      this.move(move1);
    }

    // place corner 3 and 1
    if (c3.pos.eq(new Point(1, -1, 1))) {
      this.move(move2);
    }

    this.move('Xi Xi');
  }

  // Phase 6: Last layer corners orientation
  private lastLayerCornersOrientation(): void {
    this.move('X X');

    const state1 = (): boolean => {
      return (
        this.cube.getPiece(1, 1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(-1, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[0] === this.cube.frontColor()
      );
    };

    const state2 = (): boolean => {
      return (
        this.cube.getPiece(-1, 1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, 1, 1)!.colors[0] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[1] === this.cube.frontColor()
      );
    };

    const state3 = (): boolean => {
      return (
        this.cube.getPiece(-1, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(1, 1, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const state4 = (): boolean => {
      return (
        this.cube.getPiece(-1, 1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(-1, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, 1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const state5 = (): boolean => {
      return (
        this.cube.getPiece(-1, 1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[0] === this.cube.frontColor()
      );
    };

    const state6 = (): boolean => {
      return (
        this.cube.getPiece(1, 1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(-1, -1, 1)!.colors[0] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 1, 1)!.colors[0] === this.cube.frontColor()
      );
    };

    const state7 = (): boolean => {
      return (
        this.cube.getPiece(1, 1, 1)!.colors[0] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[0] === this.cube.frontColor() &&
        this.cube.getPiece(-1, -1, 1)!.colors[0] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 1, 1)!.colors[0] === this.cube.frontColor()
      );
    };

    const state8 = (): boolean => {
      return (
        this.cube.getPiece(1, 1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(1, -1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(-1, -1, 1)!.colors[2] === this.cube.frontColor() &&
        this.cube.getPiece(-1, 1, 1)!.colors[2] === this.cube.frontColor()
      );
    };

    const move1 = 'Ri Fi R Fi Ri F F R F F';
    const move2 = 'R F Ri F R F F Ri F F';

    let count = 0;
    while (!state8()) {
      if (state1()) this.move(move1);
      else if (state2()) this.move(move2);
      else if (state3()) this.move(`${move2} F F ${move1}`);
      else if (state4()) this.move(`${move2} ${move1}`);
      else if (state5()) this.move(`${move1} F ${move2}`);
      else if (state6()) this.move(`${move1} Fi ${move1}`);
      else if (state7()) this.move(`${move1} F F ${move1}`);
      else this.move('F');

      count++;
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in lastLayerCornersOrientation loop');
      }
    }

    // rotate corners into correct locations
    const bruCorner = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor(), this.cube.upColor())!;
    let rotCount = 0;
    while (!bruCorner.pos.eq(new Point(1, 1, 1))) {
      this.move('F');
      rotCount++;
      if (rotCount > 4) break;
    }

    this.move('Xi Xi');
  }

  // Phase 7: Last layer edges
  private lastLayerEdges(): void {
    this.move('X X');

    const brEdge = this.cube.findPiece(this.cube.frontColor(), this.cube.rightColor())!;
    const blEdge = this.cube.findPiece(this.cube.frontColor(), this.cube.leftColor())!;
    const buEdge = this.cube.findPiece(this.cube.frontColor(), this.cube.upColor())!;
    const bdEdge = this.cube.findPiece(this.cube.frontColor(), this.cube.downColor())!;

    const state1 = (): boolean => {
      return (
        buEdge.colors[2] !== this.cube.frontColor() &&
        bdEdge.colors[2] !== this.cube.frontColor() &&
        blEdge.colors[2] !== this.cube.frontColor() &&
        brEdge.colors[2] !== this.cube.frontColor()
      );
    };

    const state2 = (): boolean => {
      return (
        buEdge.colors[2] === this.cube.frontColor() ||
        bdEdge.colors[2] === this.cube.frontColor() ||
        blEdge.colors[2] === this.cube.frontColor() ||
        brEdge.colors[2] === this.cube.frontColor()
      );
    };

    const cycleMoveStr = 'R R F D Ui R R Di U F R R';
    const hPatternMoveStr = 'Ri S Ri Ri S S Ri Fi Fi R Si Si Ri Ri Si R Fi Fi';
    const fishMoveStr = `Di Li ${hPatternMoveStr} L D`;

    if (state1()) {
      this._handleLastLayerState1(brEdge, blEdge, buEdge, bdEdge, cycleMoveStr, hPatternMoveStr);
    }
    if (state2()) {
      this._handleLastLayerState2(brEdge, blEdge, buEdge, bdEdge, cycleMoveStr);
    }

    const hPattern1 = (): boolean => {
      return (
        this.cube.getPiece(-1, 0, 1)!.colors[0] !== this.cube.leftColor() &&
        this.cube.getPiece(1, 0, 1)!.colors[0] !== this.cube.rightColor() &&
        this.cube.getPiece(0, -1, 1)!.colors[1] === this.cube.downColor() &&
        this.cube.getPiece(0, 1, 1)!.colors[1] === this.cube.upColor()
      );
    };

    const hPattern2 = (): boolean => {
      return (
        this.cube.getPiece(-1, 0, 1)!.colors[0] === this.cube.leftColor() &&
        this.cube.getPiece(1, 0, 1)!.colors[0] === this.cube.rightColor() &&
        this.cube.getPiece(0, -1, 1)!.colors[1] === this.cube.frontColor() &&
        this.cube.getPiece(0, 1, 1)!.colors[1] === this.cube.frontColor()
      );
    };

    const fishPattern = (): boolean => {
      const fd = this.cube.getPiece(0, -1, 1)!;
      const fr = this.cube.getPiece(1, 0, 1)!;
      return (
        fd.colors[2] === this.cube.downColor() &&
        fr.colors[2] === this.cube.rightColor() &&
        fd.colors[1] === this.cube.frontColor() &&
        fr.colors[0] === this.cube.frontColor()
      );
    };

    let count = 0;
    while (!this.cube.isSolved()) {
      for (let i = 0; i < 4; i++) {
        if (fishPattern()) {
          this.move(fishMoveStr);
          if (this.cube.isSolved()) {
            this.move('Xi Xi');
            return;
          }
        } else {
          this.move('Z');
        }
      }

      if (hPattern1()) {
        this.move(hPatternMoveStr);
      } else if (hPattern2()) {
        this.move(`Z ${hPatternMoveStr} Zi`);
      } else {
        this.move(cycleMoveStr);
      }
      count++;
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in lastLayerEdges loop');
      }
    }

    this.move('Xi Xi');
  }

  private _handleLastLayerState1(
    _brEdge: Piece, _blEdge: Piece, _buEdge: Piece, _bdEdge: Piece,
    _cycleMoveStr: string, hMoveStr: string,
  ): void {
    const checkEdgeLr = (): boolean => {
      const piece = this.cube.getPiece(-1, 0, 1)!;
      return piece.colors[2] === this.cube.leftColor();
    };

    let count = 0;
    while (!checkEdgeLr()) {
      this.move('F');
      count++;
      if (count === 4) {
        throw new Error('Failed to handle last layer state1');
      }
    }

    this.move(hMoveStr);

    for (let k = 0; k < count; k++) {
      this.move('Fi');
    }
  }

  private _handleLastLayerState2(
    _brEdge: Piece, _blEdge: Piece, _buEdge: Piece, _bdEdge: Piece,
    cycleMoveStr: string,
  ): void {
    const correctEdge = (): Piece | null => {
      let piece = this.cube.getPiece(-1, 0, 1)!;
      if (piece.colors[2] === this.cube.frontColor() && piece.colors[0] === this.cube.leftColor()) return piece;
      piece = this.cube.getPiece(1, 0, 1)!;
      if (piece.colors[2] === this.cube.frontColor() && piece.colors[0] === this.cube.rightColor()) return piece;
      piece = this.cube.getPiece(0, 1, 1)!;
      if (piece.colors[2] === this.cube.frontColor() && piece.colors[1] === this.cube.upColor()) return piece;
      piece = this.cube.getPiece(0, -1, 1)!;
      if (piece.colors[2] === this.cube.frontColor() && piece.colors[1] === this.cube.downColor()) return piece;
      return null;
    };

    let count = 0;
    let edge: Piece | null = null;
    while (true) {
      edge = correctEdge();
      if (edge !== null) break;
      this.move(cycleMoveStr);
      count++;
      if (count % 3 === 0) this.move('Z');
      if (count >= this.infiniteLoopMax) {
        throw new Error('Stuck in lastLayerState2 loop');
      }
    }

    while (!edge!.pos.eq(new Point(-1, 0, 1))) {
      this.move('Z');
    }
  }
}

// ============================================================================
// Conversion: CubeState → cube_str for PieceCube
// ============================================================================
function cubeStateToCubeStr(cube: CubeState): string {
  // CubeState faces: U=0, D=1, F=2, B=3, L=4, R=5
  // pglass cube_str layout (54 chars):
  //         UUU           0  1  2
  //         UUU           3  4  5
  //         UUU           6  7  8
  //     LLL FFF RRR BBB   9-11 12-14 15-17 18-20
  //     LLL FFF RRR BBB   21-23 24-26 27-29 30-32
  //     LLL FFF RRR BBB   33-35 36-38 39-41 42-44
  //         DDD           45 46 47
  //         DDD           48 49 50
  //         DDD           51 52 53

  const U = cube[0];
  const D = cube[1];
  const F = cube[2];
  const B = cube[3];
  const L = cube[4];
  const R = cube[5];

  const str: string[] = new Array(54);

  // U face (indices 0-8)
  for (let i = 0; i < 9; i++) str[i] = U[i];

  // Middle rows: L, F, R, B interleaved
  for (let row = 0; row < 3; row++) {
    const base = 9 + row * 12;
    for (let col = 0; col < 3; col++) {
      str[base + col] = L[row * 3 + col];
      str[base + 3 + col] = F[row * 3 + col];
      str[base + 6 + col] = R[row * 3 + col];
      str[base + 9 + col] = B[row * 3 + col];
    }
  }

  // D face (indices 45-53)
  for (let i = 0; i < 9; i++) str[45 + i] = D[i];

  return str.join('');
}

// ============================================================================
// Convert solver moves (pglass notation) to our Move[] type
// ============================================================================
function convertSolverMoves(moves: string[]): Move[] {
  const result: Move[] = [];
  const faceSet = new Set(['U', 'D', 'F', 'B', 'L', 'R']);

  for (const m of moves) {
    const base = m[0];
    if (!faceSet.has(base)) {
      // Should not happen after optimization (X, Y, Z, M, E, S removed)
      // Skip non-face moves
      continue;
    }

    if (m.length === 1) {
      // e.g. "R" → "R"
      result.push(m as Move);
    } else if (m.endsWith('i')) {
      // e.g. "Ri" → "R'"
      result.push((base + "'") as Move);
    }
  }

  // Merge consecutive same-face moves: R R → R2, R R R → R'
  const merged: Move[] = [];
  let i = 0;
  while (i < result.length) {
    if (i + 1 < result.length && result[i] === result[i + 1] && !result[i].includes("'") && !result[i].includes('2')) {
      // Two identical CW quarter turns → half turn
      merged.push((result[i][0] + '2') as Move);
      i += 2;
    } else if (i + 1 < result.length) {
      // Check if same face inverse pair (should have been removed by optimizer, but just in case)
      const a = result[i];
      const b = result[i + 1];
      const aFace = a[0];
      const bFace = b[0];
      if (aFace === bFace && a.includes("'") === b.includes("'") && a.includes('2') && b.includes('2')) {
        // Two half turns cancel
        i += 2;
        continue;
      }
      merged.push(result[i]);
      i++;
    } else {
      merged.push(result[i]);
      i++;
    }
  }

  return merged;
}

// ============================================================================
// Main export: solve any CubeState
// ============================================================================
export function solveCube(cubeState: CubeState): Move[] {
  const cubeStr = cubeStateToCubeStr(cubeState);
  const pieceCube = new PieceCube(cubeStr);

  if (pieceCube.isSolved()) return [];

  const solver = new Solver(pieceCube);
  try {
    solver.solve();
  } catch {
    // If the solver fails (e.g. unsolvable state), return empty
    return [];
  }

  // Optimize to remove whole-cube rotations and redundant moves
  const optimized = optimizeMoveList(solver.moves);

  // Convert from pglass notation (Li, Ri, etc.) to our notation (L', R', etc.)
  return convertSolverMoves(optimized);
}
