import type { GridMatrix, AlgorithmResult, GridNode } from '../types/graph';
import { getNeighbors, reconstructPath, cloneGrid, manhattanDistance } from './helpers';

export function astar(
  sourceGrid: GridMatrix,
  startPos: { row: number; col: number },
  endPos: { row: number; col: number }
): AlgorithmResult {
  const grid = cloneGrid(sourceGrid);
  const visitedNodesInOrder: GridNode[] = [];
  const startNode = grid[startPos.row][startPos.col];
  const endNode = grid[endPos.row][endPos.col];

  startNode.distance = 0;
  startNode.heuristic = manhattanDistance(startPos, endPos);
  startNode.totalCost = startNode.heuristic;

  const openSet: GridNode[] = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.totalCost - b.totalCost);
    const current = openSet.shift()!;

    if (current.isVisited) continue;
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
      const tentativeG = current.distance + 1;
      if (tentativeG < neighbor.distance) {
        neighbor.distance = tentativeG;
        neighbor.heuristic = manhattanDistance(
          { row: neighbor.row, col: neighbor.col },
          endPos
        );
        neighbor.totalCost = neighbor.distance + neighbor.heuristic;
        neighbor.parent = current;
        openSet.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}
