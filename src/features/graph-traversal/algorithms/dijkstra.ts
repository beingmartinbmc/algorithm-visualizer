import type { GridMatrix, AlgorithmResult, GridNode } from '../types/graph';
import { getNeighbors, reconstructPath, cloneGrid } from './helpers';

export function dijkstra(
  sourceGrid: GridMatrix,
  startPos: { row: number; col: number },
  endPos: { row: number; col: number }
): AlgorithmResult {
  const grid = cloneGrid(sourceGrid);
  const visitedNodesInOrder: GridNode[] = [];
  const startNode = grid[startPos.row][startPos.col];
  const endNode = grid[endPos.row][endPos.col];

  startNode.distance = 0;
  const unvisited: GridNode[] = grid.flat();

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const current = unvisited.shift()!;

    if (current.distance === Infinity) break;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(current),
      };
    }

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const newDist = current.distance + 1;
      if (newDist < neighbor.distance) {
        neighbor.distance = newDist;
        neighbor.parent = current;
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}
