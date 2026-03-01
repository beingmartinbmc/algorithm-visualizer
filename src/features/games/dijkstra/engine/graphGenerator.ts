import type { GameGraph, GraphNode, GraphEdge } from '../types/dijkstra';

let nodeCounter = 0;
let edgeCounter = 0;

function makeNodeId(): string {
  return String.fromCharCode(65 + (nodeCounter++ % 26));
}

function resetCounters() {
  nodeCounter = 0;
  edgeCounter = 0;
}

function makeEdgeId(): string {
  return `e${edgeCounter++}`;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function generatePredefinedMap(index: number): GameGraph {
  resetCounters();
  const maps = [predefinedMap1, predefinedMap2, predefinedMap3];
  return maps[index % maps.length]();
}

function predefinedMap1(): GameGraph {
  const nodes: GraphNode[] = [
    { id: 'A', x: 80, y: 200, distance: Infinity, visited: false, previous: null },
    { id: 'B', x: 220, y: 80, distance: Infinity, visited: false, previous: null },
    { id: 'C', x: 220, y: 320, distance: Infinity, visited: false, previous: null },
    { id: 'D', x: 400, y: 80, distance: Infinity, visited: false, previous: null },
    { id: 'E', x: 400, y: 200, distance: Infinity, visited: false, previous: null },
    { id: 'F', x: 400, y: 320, distance: Infinity, visited: false, previous: null },
    { id: 'G', x: 560, y: 200, distance: Infinity, visited: false, previous: null },
    { id: 'H', x: 700, y: 200, distance: Infinity, visited: false, previous: null },
  ];
  nodeCounter = 8;
  const edges: GraphEdge[] = [
    { id: 'e0', source: 'A', destination: 'B', weight: 4 },
    { id: 'e1', source: 'A', destination: 'C', weight: 2 },
    { id: 'e2', source: 'B', destination: 'D', weight: 5 },
    { id: 'e3', source: 'B', destination: 'E', weight: 10 },
    { id: 'e4', source: 'C', destination: 'E', weight: 3 },
    { id: 'e5', source: 'C', destination: 'F', weight: 8 },
    { id: 'e6', source: 'D', destination: 'G', weight: 2 },
    { id: 'e7', source: 'E', destination: 'G', weight: 6 },
    { id: 'e8', source: 'F', destination: 'G', weight: 1 },
    { id: 'e9', source: 'G', destination: 'H', weight: 3 },
    { id: 'e10', source: 'D', destination: 'E', weight: 1 },
  ];
  edgeCounter = 11;
  return { nodes, edges };
}

function predefinedMap2(): GameGraph {
  const nodes: GraphNode[] = [
    { id: 'A', x: 100, y: 150, distance: Infinity, visited: false, previous: null },
    { id: 'B', x: 250, y: 50, distance: Infinity, visited: false, previous: null },
    { id: 'C', x: 250, y: 250, distance: Infinity, visited: false, previous: null },
    { id: 'D', x: 400, y: 150, distance: Infinity, visited: false, previous: null },
    { id: 'E', x: 550, y: 50, distance: Infinity, visited: false, previous: null },
    { id: 'F', x: 550, y: 250, distance: Infinity, visited: false, previous: null },
    { id: 'G', x: 700, y: 150, distance: Infinity, visited: false, previous: null },
  ];
  nodeCounter = 7;
  const edges: GraphEdge[] = [
    { id: 'e0', source: 'A', destination: 'B', weight: 7 },
    { id: 'e1', source: 'A', destination: 'C', weight: 3 },
    { id: 'e2', source: 'B', destination: 'D', weight: 2 },
    { id: 'e3', source: 'C', destination: 'D', weight: 5 },
    { id: 'e4', source: 'C', destination: 'F', weight: 12 },
    { id: 'e5', source: 'D', destination: 'E', weight: 4 },
    { id: 'e6', source: 'D', destination: 'F', weight: 3 },
    { id: 'e7', source: 'E', destination: 'G', weight: 1 },
    { id: 'e8', source: 'F', destination: 'G', weight: 2 },
    { id: 'e9', source: 'B', destination: 'E', weight: 9 },
  ];
  edgeCounter = 10;
  return { nodes, edges };
}

function predefinedMap3(): GameGraph {
  const nodes: GraphNode[] = [
    { id: 'A', x: 80, y: 180, distance: Infinity, visited: false, previous: null },
    { id: 'B', x: 200, y: 60, distance: Infinity, visited: false, previous: null },
    { id: 'C', x: 200, y: 300, distance: Infinity, visited: false, previous: null },
    { id: 'D', x: 350, y: 180, distance: Infinity, visited: false, previous: null },
    { id: 'E', x: 500, y: 60, distance: Infinity, visited: false, previous: null },
    { id: 'F', x: 500, y: 300, distance: Infinity, visited: false, previous: null },
    { id: 'G', x: 650, y: 120, distance: Infinity, visited: false, previous: null },
    { id: 'H', x: 650, y: 240, distance: Infinity, visited: false, previous: null },
    { id: 'I', x: 780, y: 180, distance: Infinity, visited: false, previous: null },
  ];
  nodeCounter = 9;
  const edges: GraphEdge[] = [
    { id: 'e0', source: 'A', destination: 'B', weight: 3 },
    { id: 'e1', source: 'A', destination: 'C', weight: 6 },
    { id: 'e2', source: 'A', destination: 'D', weight: 7 },
    { id: 'e3', source: 'B', destination: 'D', weight: 2 },
    { id: 'e4', source: 'B', destination: 'E', weight: 8 },
    { id: 'e5', source: 'C', destination: 'D', weight: 3 },
    { id: 'e6', source: 'C', destination: 'F', weight: 4 },
    { id: 'e7', source: 'D', destination: 'E', weight: 2 },
    { id: 'e8', source: 'D', destination: 'F', weight: 5 },
    { id: 'e9', source: 'E', destination: 'G', weight: 1 },
    { id: 'e10', source: 'F', destination: 'H', weight: 2 },
    { id: 'e11', source: 'G', destination: 'I', weight: 4 },
    { id: 'e12', source: 'H', destination: 'I', weight: 3 },
    { id: 'e13', source: 'G', destination: 'H', weight: 2 },
  ];
  edgeCounter = 14;
  return { nodes, edges };
}

export function generateRandomMap(nodeCount: number = 12): GameGraph {
  resetCounters();
  const W = 750;
  const H = 360;
  const padding = 60;
  const minDist = 80;

  const nodes: GraphNode[] = [];
  let attempts = 0;
  while (nodes.length < nodeCount && attempts < 1000) {
    const x = padding + Math.random() * (W - padding * 2);
    const y = padding + Math.random() * (H - padding * 2);
    const tooClose = nodes.some((n) => distance(n, { x, y }) < minDist);
    if (!tooClose) {
      nodes.push({
        id: makeNodeId(),
        x: Math.round(x),
        y: Math.round(y),
        distance: Infinity,
        visited: false,
        previous: null,
      });
    }
    attempts++;
  }

  const edges: GraphEdge[] = [];
  const added = new Set<string>();

  // Ensure connected via spanning tree
  const inTree = new Set<number>([0]);
  const remaining = new Set<number>(nodes.map((_, i) => i).filter((i) => i > 0));

  while (remaining.size > 0) {
    let bestDist = Infinity;
    let bestFrom = 0;
    let bestTo = 0;
    for (const from of inTree) {
      for (const to of remaining) {
        const d = distance(nodes[from], nodes[to]);
        if (d < bestDist) {
          bestDist = d;
          bestFrom = from;
          bestTo = to;
        }
      }
    }
    inTree.add(bestTo);
    remaining.delete(bestTo);
    const w = Math.max(1, Math.round(bestDist / 40) + Math.floor(Math.random() * 3));
    const key = [nodes[bestFrom].id, nodes[bestTo].id].sort().join('-');
    if (!added.has(key)) {
      added.add(key);
      edges.push({ id: makeEdgeId(), source: nodes[bestFrom].id, destination: nodes[bestTo].id, weight: w });
    }
  }

  // Add extra edges for variety
  const extraEdges = Math.floor(nodeCount * 0.6);
  for (let i = 0; i < extraEdges; i++) {
    const a = Math.floor(Math.random() * nodes.length);
    let b = Math.floor(Math.random() * nodes.length);
    if (a === b) b = (b + 1) % nodes.length;
    const key = [nodes[a].id, nodes[b].id].sort().join('-');
    if (!added.has(key)) {
      added.add(key);
      const d = distance(nodes[a], nodes[b]);
      const w = Math.max(1, Math.round(d / 40) + Math.floor(Math.random() * 3));
      edges.push({ id: makeEdgeId(), source: nodes[a].id, destination: nodes[b].id, weight: w });
    }
  }

  return { nodes, edges };
}

export function getAdjacentNodes(graph: GameGraph, nodeId: string): { id: string; weight: number }[] {
  const adj: { id: string; weight: number }[] = [];
  for (const e of graph.edges) {
    if (e.source === nodeId) adj.push({ id: e.destination, weight: e.weight });
    if (e.destination === nodeId) adj.push({ id: e.source, weight: e.weight });
  }
  return adj;
}
