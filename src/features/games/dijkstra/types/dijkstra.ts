export type DijkstraGameMode = 'explore' | 'visualize' | 'race';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  distance: number;
  visited: boolean;
  previous: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  destination: string;
  weight: number;
}

export interface GameGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DijkstraStep {
  type: 'init' | 'visit' | 'relax' | 'done';
  currentNodeId: string;
  description: string;
  distances: Record<string, number>;
  visited: string[];
  previous: Record<string, string | null>;
  queue: { id: string; distance: number }[];
  relaxedEdge?: { from: string; to: string; oldDist: number; newDist: number };
}

export interface GameState {
  mode: DijkstraGameMode;
  startNode: string | null;
  endNode: string | null;
  playerPath: string[];
  playerCost: number;
  optimalPath: string[];
  optimalCost: number;
  isAlgoRunning: boolean;
  algoStepIndex: number;
  score: number;
  timer: number;
  isTimerRunning: boolean;
}

export const MODE_INFO: Record<DijkstraGameMode, { name: string; description: string }> = {
  explore: {
    name: 'Free Explore',
    description: 'Pick any route and compare your cost to the optimal Dijkstra path.',
  },
  visualize: {
    name: 'Visualizer',
    description: 'Watch Dijkstra\'s algorithm run step-by-step with priority queue updates.',
  },
  race: {
    name: 'Race Mode',
    description: 'Beat the algorithm! Find the shortest path as fast as you can.',
  },
};

export const GAME_DESCRIPTION = {
  title: 'Dijkstra Delivery Simulator',
  subtitle: 'Based on Edsger W. Dijkstra\'s shortest-path algorithm',
  what: 'You\'re a delivery driver navigating a city. Intersections are nodes, roads are edges, and traffic time is the weight. Find the shortest route from start to destination — then see how your path compares to Dijkstra\'s optimal solution.',
  skills: [
    'Graph Theory',
    'Shortest Path',
    'Greedy Algorithms',
    'Priority Queues',
  ],
};
