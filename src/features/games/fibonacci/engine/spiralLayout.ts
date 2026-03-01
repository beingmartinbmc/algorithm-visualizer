import type { PlacedSquare, Direction } from '../types/fibonacci';
import { DIRECTION_ORDER } from '../types/fibonacci';

export function getNextDirection(current: Direction): Direction {
  const idx = DIRECTION_ORDER.indexOf(current);
  return DIRECTION_ORDER[(idx + 1) % 4];
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function getBoundingBox(squares: PlacedSquare[]): BoundingBox {
  if (squares.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const sq of squares) {
    minX = Math.min(minX, sq.x);
    minY = Math.min(minY, sq.y);
    maxX = Math.max(maxX, sq.x + sq.size);
    maxY = Math.max(maxY, sq.y + sq.size);
  }
  return { minX, minY, maxX, maxY };
}

export function computeNextPosition(
  placedSquares: PlacedSquare[],
  nextSize: number,
  directionIndex: number
): { x: number; y: number; direction: Direction } {
  if (placedSquares.length === 0) {
    return { x: 0, y: 0, direction: 'right' };
  }

  if (placedSquares.length === 1) {
    const first = placedSquares[0];
    return { x: first.x + first.size, y: first.y, direction: 'right' };
  }

  const bb = getBoundingBox(placedSquares);
  const direction = DIRECTION_ORDER[directionIndex % 4];

  let x = 0, y = 0;

  switch (direction) {
    case 'right':
      x = bb.maxX;
      y = bb.maxY - nextSize;
      break;
    case 'up':
      x = bb.maxX - nextSize;
      y = bb.minY - nextSize;
      break;
    case 'left':
      x = bb.minX - nextSize;
      y = bb.minY;
      break;
    case 'down':
      x = bb.minX;
      y = bb.maxY;
      break;
  }

  return { x, y, direction };
}

export function getArcPath(square: PlacedSquare): string {
  const { x, y, size, direction } = square;
  const r = size;

  switch (direction) {
    case 'right':
      return `M ${x} ${y + size} A ${r} ${r} 0 0 1 ${x + size} ${y}`;
    case 'up':
      return `M ${x + size} ${y + size} A ${r} ${r} 0 0 1 ${x} ${y}`;
    case 'left':
      return `M ${x + size} ${y} A ${r} ${r} 0 0 1 ${x} ${y + size}`;
    case 'down':
      return `M ${x} ${y} A ${r} ${r} 0 0 1 ${x + size} ${y + size}`;
    default:
      return '';
  }
}

export function buildInitialSquares(): PlacedSquare[] {
  const sq1: PlacedSquare = { id: 0, size: 1, x: 0, y: 0, direction: 'right', fibIndex: 0 };
  const sq2: PlacedSquare = { id: 1, size: 1, x: 1, y: 0, direction: 'right', fibIndex: 1 };
  return [sq1, sq2];
}
