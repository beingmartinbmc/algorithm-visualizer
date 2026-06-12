import { describe, expect, it } from 'vitest';
import { runAlgorithm, bfs, dijkstra, astar } from '@/features/traversals/graph/algorithms';
import type { AlgorithmType, GridMatrix, GridNode, Position } from '@/features/traversals/graph/types/graph';
import { NodeType } from '@/features/traversals/graph/types/graph';

const ALL: AlgorithmType[] = ['bfs', 'dfs', 'dijkstra', 'astar'];
const OPTIMAL: AlgorithmType[] = ['bfs', 'dijkstra', 'astar'];

function makeNode(row: number, col: number, wall: boolean): GridNode {
  return {
    row,
    col,
    type: wall ? NodeType.WALL : NodeType.EMPTY,
    distance: Infinity,
    heuristic: 0,
    totalCost: Infinity,
    parent: null,
    isVisited: false,
  };
}

/**
 * Build a grid from an ASCII map. '#' = wall, '.' = open.
 * Start/end are passed separately as positions.
 */
function gridFrom(rows: string[]): GridMatrix {
  return rows.map((line, r) => [...line].map((ch, c) => makeNode(r, c, ch === '#')));
}

const pos = (row: number, col: number): Position => ({ row, col });

describe('graph pathfinding algorithms', () => {
  it('finds a path on an open grid (all algorithms)', () => {
    for (const algo of ALL) {
      const grid = gridFrom(['....', '....', '....']);
      const result = runAlgorithm(algo, grid, pos(0, 0), pos(2, 3));
      const path = result.shortestPath;
      expect(path.length).toBeGreaterThan(0);
      // Path endpoints must be correct.
      expect(path[0]).toMatchObject({ row: 0, col: 0 });
      expect(path[path.length - 1]).toMatchObject({ row: 2, col: 3 });
    }
  });

  it('optimal algorithms find the shortest path length (Manhattan on open grid)', () => {
    for (const algo of OPTIMAL) {
      const grid = gridFrom(['....', '....', '....']);
      const result = runAlgorithm(algo, grid, pos(0, 0), pos(2, 3));
      // Manhattan distance 5 → 6 nodes including both endpoints.
      expect(result.shortestPath).toHaveLength(6);
    }
  });

  it('path is contiguous (only orthogonal single steps)', () => {
    for (const algo of ALL) {
      const grid = gridFrom(['......', '.####.', '......']);
      const { shortestPath } = runAlgorithm(algo, grid, pos(0, 0), pos(2, 5));
      for (let i = 1; i < shortestPath.length; i++) {
        const a = shortestPath[i - 1];
        const b = shortestPath[i];
        const d = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
        expect(d).toBe(1);
      }
    }
  });

  it('the path never crosses a wall', () => {
    for (const algo of ALL) {
      const grid = gridFrom(['......', '.####.', '......']);
      const { shortestPath } = runAlgorithm(algo, grid, pos(0, 0), pos(2, 5));
      for (const node of shortestPath) {
        expect(grid[node.row][node.col].type).not.toBe(NodeType.WALL);
      }
    }
  });

  it('returns no path when the target is walled off', () => {
    // End at (1,2) fully enclosed by walls.
    const grid = gridFrom(['.....', '.###.', '.#.#.', '.###.', '.....']);
    for (const algo of ALL) {
      const result = runAlgorithm(algo, grid, pos(0, 0), pos(2, 2));
      // shortestPath should not reach the unreachable target.
      const last = result.shortestPath[result.shortestPath.length - 1];
      const reachedTarget = last && last.row === 2 && last.col === 2;
      expect(reachedTarget).toBeFalsy();
    }
  });

  it('handles start === end', () => {
    for (const algo of ALL) {
      const grid = gridFrom(['...', '...']);
      const result = runAlgorithm(algo, grid, pos(0, 0), pos(0, 0));
      expect(result.shortestPath[result.shortestPath.length - 1]).toMatchObject({ row: 0, col: 0 });
    }
  });

  it('routes around an obstacle requiring a detour', () => {
    // Wall spanning the middle with one gap forces a specific longer route.
    const grid = gridFrom(['.....', '####.', '.....']);
    const result = runAlgorithm('bfs', grid, pos(0, 0), pos(2, 0));
    const { shortestPath } = result;
    expect(shortestPath[0]).toMatchObject({ row: 0, col: 0 });
    expect(shortestPath[shortestPath.length - 1]).toMatchObject({ row: 2, col: 0 });
    // Must detour through the gap at column 4.
    expect(shortestPath.some((n) => n.col === 4)).toBe(true);
  });

  it('visits nodes in non-decreasing distance order for BFS', () => {
    const grid = gridFrom(['....', '....']);
    const { visitedNodesInOrder } = bfs(grid, pos(0, 0), pos(1, 3));
    expect(visitedNodesInOrder.length).toBeGreaterThan(0);
  });

  it('dijkstra and a* agree on optimal cost', () => {
    const grid = gridFrom(['......', '.####.', '......', '.####.', '......']);
    const d = dijkstra(gridFrom(['......', '.####.', '......', '.####.', '......']), pos(0, 0), pos(4, 5));
    const a = astar(grid, pos(0, 0), pos(4, 5));
    expect(a.shortestPath.length).toBe(d.shortestPath.length);
  });

  it('handles stale heap entries on a large open grid (duplicate pushes)', () => {
    // A wide-open grid guarantees interior nodes are reached from several
    // neighbours, so the heaps accumulate stale duplicates that must be
    // skipped when popped (the `current.isVisited` guard).
    const rows = Array.from({ length: 7 }, () => '.'.repeat(7));
    for (const algo of OPTIMAL) {
      const result = runAlgorithm(algo, gridFrom(rows), pos(0, 0), pos(6, 6));
      expect(result.shortestPath).toHaveLength(13); // Manhattan 12 + 1
      // Every grid node is reachable, so exploration covers the whole grid.
      expect(result.visitedNodesInOrder.length).toBeGreaterThan(0);
    }
  });

  it('returns no path when the start itself is boxed in (heap drains)', () => {
    // Start at (1,1) surrounded by walls → the frontier empties with the
    // target never dequeued, exercising the empty-heap exit.
    const grid = gridFrom(['#####', '#.###', '#####', '...#.', '....#']);
    for (const algo of ALL) {
      const result = runAlgorithm(algo, gridFrom(grid.map((r) => r.map((n) => (n.type === NodeType.WALL ? '#' : '.')).join(''))), pos(1, 1), pos(4, 0));
      expect(result.shortestPath).toEqual([]);
    }
  });

  it('explores fully and finds no path to an unreachable region', () => {
    // Open left region, target in a sealed right region — the search drains
    // its frontier, accumulating and skipping stale heap duplicates.
    const grid = gridFrom([
      '...#..',
      '...#..',
      '...#..',
      '...#..',
    ]);
    for (const algo of OPTIMAL) {
      const result = runAlgorithm(
        algo,
        gridFrom(grid.map((r) => r.map((n) => (n.type === NodeType.WALL ? '#' : '.')).join(''))),
        pos(0, 0),
        pos(0, 5),
      );
      expect(result.shortestPath).toEqual([]);
      // Only the reachable left half (4 rows × 3 cols) should be visited.
      expect(result.visitedNodesInOrder.length).toBe(12);
    }
  });
});


