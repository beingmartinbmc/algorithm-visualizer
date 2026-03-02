import type { GridMatrix, GridNode, AlgorithmType } from '@/features/traversals/graph/types/graph';
import { NodeType } from '@/features/traversals/graph/types/graph';
import { runAlgorithm } from '@/features/traversals/graph/algorithms';

const PF_ROWS = 15;
const PF_COLS = 25;
const WALL_DENSITY = 0.25;

export type PathAlgorithm = AlgorithmType;

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

export function createBattleGrid(): { grid: GridMatrix; start: { row: number; col: number }; end: { row: number; col: number } } {
  const grid: GridMatrix = [];
  for (let r = 0; r < PF_ROWS; r++) {
    const row: GridNode[] = [];
    for (let c = 0; c < PF_COLS; c++) {
      row.push({
        row: r,
        col: c,
        type: NodeType.EMPTY,
        distance: Infinity,
        heuristic: 0,
        totalCost: Infinity,
        parent: null,
        isVisited: false,
      });
    }
    grid.push(row);
  }

  const start = { row: Math.floor(PF_ROWS / 2), col: 1 };
  const end = { row: Math.floor(PF_ROWS / 2), col: PF_COLS - 2 };
  grid[start.row][start.col].type = NodeType.START;
  grid[end.row][end.col].type = NodeType.END;

  for (let r = 0; r < PF_ROWS; r++) {
    for (let c = 0; c < PF_COLS; c++) {
      if ((r === start.row && c === start.col) || (r === end.row && c === end.col)) continue;
      if (Math.random() < WALL_DENSITY) {
        grid[r][c].type = NodeType.WALL;
      }
    }
  }

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
