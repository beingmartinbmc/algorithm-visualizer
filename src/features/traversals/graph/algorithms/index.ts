import type { AlgorithmType, GridMatrix, AlgorithmResult } from '../types/graph';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';
import { astar } from './astar';

const algorithmMap: Record<AlgorithmType, (grid: GridMatrix, start: { row: number; col: number }, end: { row: number; col: number }) => AlgorithmResult> = {
  bfs,
  dfs,
  dijkstra,
  astar,
};

export function runAlgorithm(
  type: AlgorithmType,
  grid: GridMatrix,
  start: { row: number; col: number },
  end: { row: number; col: number }
): AlgorithmResult {
  return algorithmMap[type](grid, start, end);
}

export { bfs, dfs, dijkstra, astar };
