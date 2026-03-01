import type { GridNode, GridMatrix, Position } from '../types/graph';
import { NodeType } from '../types/graph';

export function getNeighbors(grid: GridMatrix, node: GridNode): GridNode[] {
  const neighbors: GridNode[] = [];
  const { row, col } = node;
  const directions: Position[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;
    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length &&
      grid[newRow][newCol].type !== NodeType.WALL &&
      !grid[newRow][newCol].isVisited
    ) {
      neighbors.push(grid[newRow][newCol]);
    }
  }

  return neighbors;
}

export function reconstructPath(endNode: GridNode): GridNode[] {
  const path: GridNode[] = [];
  let current: GridNode | null = endNode;
  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function cloneGrid(grid: GridMatrix): GridMatrix {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      parent: null,
      isVisited: false,
      distance: Infinity,
      heuristic: 0,
      totalCost: Infinity,
    }))
  );
}
