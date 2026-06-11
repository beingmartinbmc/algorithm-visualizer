import type { GridMatrix, AlgorithmResult, GridNode } from '../types/graph';
import { getNeighbors, reconstructPath, cloneGrid } from './helpers';
import { MinHeap } from '@/lib/MinHeap';

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
  const heap = new MinHeap<GridNode>((a, b) => a.distance - b.distance);
  heap.push(startNode);

  while (heap.size > 0) {
    const current = heap.pop()!;

    // The heap can contain stale entries (we push duplicates rather than
    // doing a decrease-key); skip any node we've already finalized.
    if (current.isVisited) continue;
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
        heap.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}
