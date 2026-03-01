import type { GridMatrix, AlgorithmResult, GridNode } from '../types/graph';
import { getNeighbors, reconstructPath, cloneGrid } from './helpers';

export function dfs(
  sourceGrid: GridMatrix,
  startPos: { row: number; col: number },
  endPos: { row: number; col: number }
): AlgorithmResult {
  const grid = cloneGrid(sourceGrid);
  const visitedNodesInOrder: GridNode[] = [];
  const startNode = grid[startPos.row][startPos.col];
  const endNode = grid[endPos.row][endPos.col];

  const stack: GridNode[] = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (stack.length > 0) {
    const current = stack.pop()!;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(current),
      };
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.parent = current;
      neighbor.distance = current.distance + 1;
      stack.push(neighbor);
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}
