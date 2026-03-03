import type { GridMatrix, GridNode, AlgorithmType } from '@/features/traversals/graph/types/graph';
import { NodeType } from '@/features/traversals/graph/types/graph';
import { runAlgorithm } from '@/features/traversals/graph/algorithms';

const PF_ROWS = 15;
const PF_COLS = 25;
const WALL_DENSITY = 0.25;

export type PathAlgorithm = AlgorithmType;
export type MazeType = 'random' | 'recursive-division' | 'dfs-maze';

export const MAZE_OPTIONS: { value: MazeType; label: string }[] = [
  { value: 'random', label: 'Random Scatter' },
  { value: 'recursive-division', label: 'Recursive Division' },
  { value: 'dfs-maze', label: 'DFS Maze' },
];

export interface PathfindingStep {
  visitedSoFar: Set<string>;
  currentNode: { row: number; col: number } | null;
  pathFound: boolean;
  pathNodes: Set<string>;
}

export interface PathfindingResult {
  steps: PathfindingStep[];
  totalVisited: number;
  pathLength: number;
  found: boolean;
}

function key(r: number, c: number) { return `${r},${c}`; }

function makeEmptyGrid(): GridMatrix {
  const grid: GridMatrix = [];
  for (let r = 0; r < PF_ROWS; r++) {
    const row: GridNode[] = [];
    for (let c = 0; c < PF_COLS; c++) {
      row.push({
        row: r, col: c, type: NodeType.EMPTY,
        distance: Infinity, heuristic: 0, totalCost: Infinity,
        parent: null, isVisited: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

function randomScatter(grid: GridMatrix, start: { row: number; col: number }, end: { row: number; col: number }) {
  for (let r = 0; r < PF_ROWS; r++) {
    for (let c = 0; c < PF_COLS; c++) {
      if ((r === start.row && c === start.col) || (r === end.row && c === end.col)) continue;
      if (Math.random() < WALL_DENSITY) grid[r][c].type = NodeType.WALL;
    }
  }
}

function recursiveDivision(grid: GridMatrix, start: { row: number; col: number }, end: { row: number; col: number }) {
  const isReserved = (r: number, c: number) =>
    (r === start.row && c === start.col) || (r === end.row && c === end.col);

  function divide(rStart: number, rEnd: number, cStart: number, cEnd: number, horizontal: boolean) {
    if (horizontal) {
      if (rEnd - rStart < 2) return;
      const possibleRows: number[] = [];
      for (let r = rStart + 1; r < rEnd; r += 1) possibleRows.push(r);
      if (possibleRows.length === 0) return;
      const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
      const passCol = cStart + Math.floor(Math.random() * (cEnd - cStart + 1));
      for (let c = cStart; c <= cEnd; c++) {
        if (c === passCol || isReserved(wallRow, c)) continue;
        grid[wallRow][c].type = NodeType.WALL;
      }
      divide(rStart, wallRow - 1, cStart, cEnd, !horizontal);
      divide(wallRow + 1, rEnd, cStart, cEnd, !horizontal);
    } else {
      if (cEnd - cStart < 2) return;
      const possibleCols: number[] = [];
      for (let c = cStart + 1; c < cEnd; c += 1) possibleCols.push(c);
      if (possibleCols.length === 0) return;
      const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
      const passRow = rStart + Math.floor(Math.random() * (rEnd - rStart + 1));
      for (let r = rStart; r <= rEnd; r++) {
        if (r === passRow || isReserved(r, wallCol)) continue;
        grid[r][wallCol].type = NodeType.WALL;
      }
      divide(rStart, rEnd, cStart, wallCol - 1, !horizontal);
      divide(rStart, rEnd, wallCol + 1, cEnd, !horizontal);
    }
  }

  divide(0, PF_ROWS - 1, 0, PF_COLS - 1, Math.random() > 0.5);
}

function dfsMaze(grid: GridMatrix, start: { row: number; col: number }, end: { row: number; col: number }) {
  // Fill everything with walls, then carve passages with DFS
  for (let r = 0; r < PF_ROWS; r++)
    for (let c = 0; c < PF_COLS; c++)
      grid[r][c].type = NodeType.WALL;

  const visited = new Set<string>();
  function carve(r: number, c: number) {
    visited.add(`${r},${c}`);
    grid[r][c].type = NodeType.EMPTY;
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < PF_ROWS && nc >= 0 && nc < PF_COLS && !visited.has(`${nr},${nc}`)) {
        // Carve the wall between current and next
        grid[r + dr / 2][c + dc / 2].type = NodeType.EMPTY;
        carve(nr, nc);
      }
    }
  }

  // Start carving from an odd cell
  const sr = start.row % 2 === 0 ? start.row + 1 : start.row;
  const sc = start.col % 2 === 0 ? start.col + 1 : start.col;
  carve(Math.min(sr, PF_ROWS - 1), Math.min(sc, PF_COLS - 1));

  // Ensure start and end cells + their neighbors are open
  grid[start.row][start.col].type = NodeType.EMPTY;
  grid[end.row][end.col].type = NodeType.EMPTY;
  if (start.col + 1 < PF_COLS) grid[start.row][start.col + 1].type = NodeType.EMPTY;
  if (end.col - 1 >= 0) grid[end.row][end.col - 1].type = NodeType.EMPTY;
}

export function createBattleGrid(mazeType: MazeType = 'random'): { grid: GridMatrix; start: { row: number; col: number }; end: { row: number; col: number } } {
  const grid = makeEmptyGrid();
  const start = { row: Math.floor(PF_ROWS / 2), col: 1 };
  const end = { row: Math.floor(PF_ROWS / 2), col: PF_COLS - 2 };

  switch (mazeType) {
    case 'recursive-division': recursiveDivision(grid, start, end); break;
    case 'dfs-maze': dfsMaze(grid, start, end); break;
    default: randomScatter(grid, start, end); break;
  }

  grid[start.row][start.col].type = NodeType.START;
  grid[end.row][end.col].type = NodeType.END;
  return { grid, start, end };
}

export function runPathfindingBattle(
  grid: GridMatrix,
  start: { row: number; col: number },
  end: { row: number; col: number },
  algorithm: PathAlgorithm,
): PathfindingResult {
  const result = runAlgorithm(algorithm, grid, start, end);
  const visited = result.visitedNodesInOrder;
  const path = result.shortestPath;

  const steps: PathfindingStep[] = [];
  const visitedSoFar = new Set<string>();

  for (let i = 0; i < visited.length; i++) {
    visitedSoFar.add(key(visited[i].row, visited[i].col));
    steps.push({
      visitedSoFar: new Set(visitedSoFar),
      currentNode: { row: visited[i].row, col: visited[i].col },
      pathFound: false,
      pathNodes: new Set(),
    });
  }

  if (path.length > 0) {
    const finalVisited = new Set(visitedSoFar);
    for (let i = 0; i < path.length; i++) {
      steps.push({
        visitedSoFar: finalVisited,
        currentNode: { row: path[i].row, col: path[i].col },
        pathFound: true,
        pathNodes: new Set(path.slice(0, i + 1).map((n) => key(n.row, n.col))),
      });
    }
  }

  return {
    steps,
    totalVisited: visited.length,
    pathLength: path.length,
    found: path.length > 0,
  };
}

export const PF_ALGORITHM_OPTIONS: { value: PathAlgorithm; label: string }[] = [
  { value: 'bfs', label: 'BFS' },
  { value: 'dfs', label: 'DFS' },
  { value: 'dijkstra', label: 'Dijkstra' },
  { value: 'astar', label: 'A*' },
];

export const PF_COMPLEXITY: Record<PathAlgorithm, { time: string; space: string; optimal: boolean }> = {
  bfs:      { time: 'O(V + E)', space: 'O(V)', optimal: true },
  dfs:      { time: 'O(V + E)', space: 'O(V)', optimal: false },
  dijkstra: { time: 'O(V² / V+E log V)', space: 'O(V)', optimal: true },
  astar:    { time: 'O(E)', space: 'O(V)', optimal: true },
};

export { PF_ROWS, PF_COLS };
