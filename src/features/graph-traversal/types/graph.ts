export const NodeType = {
  EMPTY: 'empty',
  WALL: 'wall',
  START: 'start',
  END: 'end',
  VISITED: 'visited',
  PATH: 'path',
  EXPLORING: 'exploring',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface GridNode {
  row: number;
  col: number;
  type: NodeType;
  distance: number;
  heuristic: number;
  totalCost: number;
  parent: GridNode | null;
  isVisited: boolean;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar';

export interface AlgorithmResult {
  visitedNodesInOrder: GridNode[];
  shortestPath: GridNode[];
}

export interface Position {
  row: number;
  col: number;
}

export type GridMatrix = GridNode[][];

export type VisualizationSpeed = 'slow' | 'medium' | 'fast' | 'instant';

export const SPEED_MAP: Record<VisualizationSpeed, number> = {
  slow: 50,
  medium: 20,
  fast: 5,
  instant: 0,
};

export const ALGORITHM_INFO: Record<AlgorithmType, { name: string; description: string; weighted: boolean; guaranteesShortestPath: boolean }> = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores all neighbors at the current depth before moving deeper. Guarantees the shortest path in unweighted graphs.',
    weighted: false,
    guaranteesShortestPath: true,
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Explores as far as possible along each branch before backtracking. Does not guarantee the shortest path.',
    weighted: false,
    guaranteesShortestPath: false,
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "Finds the shortest path using a priority queue. Guarantees the shortest path in weighted graphs.",
    weighted: true,
    guaranteesShortestPath: true,
  },
  astar: {
    name: 'A* Search',
    description: 'Uses heuristics to guide the search toward the goal. Guarantees the shortest path with an admissible heuristic.',
    weighted: true,
    guaranteesShortestPath: true,
  },
};
