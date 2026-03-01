import type { GameGraph, DijkstraStep } from '../types/dijkstra';
import { getAdjacentNodes } from './graphGenerator';

export function runDijkstra(graph: GameGraph, startId: string, endId: string): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visitedSet = new Set<string>();

  for (const node of graph.nodes) {
    dist[node.id] = Infinity;
    prev[node.id] = null;
  }
  dist[startId] = 0;

  const queue: { id: string; distance: number }[] = [{ id: startId, distance: 0 }];

  steps.push({
    type: 'init',
    currentNodeId: startId,
    description: `Initialize: set distance of ${startId} to 0, all others to ∞`,
    distances: { ...dist },
    visited: [],
    previous: { ...prev },
    queue: [...queue],
  });

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;

    if (visitedSet.has(current.id)) continue;
    visitedSet.add(current.id);

    const visited = [...visitedSet];

    steps.push({
      type: 'visit',
      currentNodeId: current.id,
      description: `Visit node ${current.id} (distance = ${dist[current.id]})`,
      distances: { ...dist },
      visited,
      previous: { ...prev },
      queue: [...queue],
    });

    if (current.id === endId) break;

    const neighbors = getAdjacentNodes(graph, current.id);

    for (const neighbor of neighbors) {
      if (visitedSet.has(neighbor.id)) continue;

      const newDist = dist[current.id] + neighbor.weight;
      const oldDist = dist[neighbor.id];

      if (newDist < oldDist) {
        dist[neighbor.id] = newDist;
        prev[neighbor.id] = current.id;

        const existing = queue.findIndex((q) => q.id === neighbor.id);
        if (existing >= 0) {
          queue[existing].distance = newDist;
        } else {
          queue.push({ id: neighbor.id, distance: newDist });
        }

        steps.push({
          type: 'relax',
          currentNodeId: current.id,
          description: `Relax edge ${current.id} → ${neighbor.id}: distance updated from ${oldDist === Infinity ? '∞' : oldDist} to ${newDist}`,
          distances: { ...dist },
          visited: [...visitedSet],
          previous: { ...prev },
          queue: [...queue],
          relaxedEdge: { from: current.id, to: neighbor.id, oldDist, newDist },
        });
      }
    }
  }

  const path = reconstructPath(prev, startId, endId);

  steps.push({
    type: 'done',
    currentNodeId: endId,
    description: path.length > 0
      ? `Done! Shortest path: ${path.join(' → ')} (cost: ${dist[endId]})`
      : `No path found from ${startId} to ${endId}`,
    distances: { ...dist },
    visited: [...visitedSet],
    previous: { ...prev },
    queue: [],
  });

  return steps;
}

export function reconstructPath(prev: Record<string, string | null>, startId: string, endId: string): string[] {
  const path: string[] = [];
  let current: string | null = endId;

  while (current !== null) {
    path.unshift(current);
    if (current === startId) break;
    current = prev[current];
  }

  if (path[0] !== startId) return [];
  return path;
}

export function getOptimalCost(graph: GameGraph, startId: string, endId: string): { path: string[]; cost: number } {
  const steps = runDijkstra(graph, startId, endId);
  const lastStep = steps[steps.length - 1];
  const path = reconstructPath(lastStep.previous, startId, endId);
  const cost = lastStep.distances[endId] ?? Infinity;
  return { path, cost: cost === Infinity ? -1 : cost };
}

export function computePlayerCost(graph: GameGraph, playerPath: string[]): number {
  let cost = 0;
  for (let i = 0; i < playerPath.length - 1; i++) {
    const edge = graph.edges.find(
      (e) =>
        (e.source === playerPath[i] && e.destination === playerPath[i + 1]) ||
        (e.destination === playerPath[i] && e.source === playerPath[i + 1])
    );
    if (!edge) return -1;
    cost += edge.weight;
  }
  return cost;
}

export function computeScore(playerCost: number, optimalCost: number, timeSeconds: number): number {
  if (optimalCost <= 0 || playerCost < 0) return 0;
  const base = 100;
  const costPenalty = (playerCost - optimalCost) * 5;
  const timePenalty = Math.floor(timeSeconds / 3);
  const perfectBonus = playerCost === optimalCost ? 50 : 0;
  return Math.max(0, base - costPenalty - timePenalty + perfectBonus);
}
