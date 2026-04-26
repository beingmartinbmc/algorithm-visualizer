export type TravelAlgorithm = 'dijkstra' | 'astar' | 'bfs' | 'greedy';

export type SimulationPhase = 'idle' | 'planning' | 'flying' | 'complete';

export interface Airport {
  code: string;
  city: string;
  country: string;
  region: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  hubScore: number;
}

export interface FlightRoute {
  id: string;
  source: string;
  destination: string;
  distanceKm: number;
  durationHours: number;
  costUsd: number;
}

export interface FrontierItem {
  code: string;
  priority: number;
}

export interface AlgorithmStep {
  type: 'init' | 'select' | 'relax' | 'enqueue' | 'dead-end' | 'done';
  airportCode: string;
  description: string;
  visited: string[];
  frontier: FrontierItem[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  relaxedRoute?: { from: string; to: string };
  route?: string[];
}

export interface FlightPlan {
  path: string[];
  totalDistanceKm: number;
  totalDurationHours: number;
  totalCostUsd: number;
  stops: number;
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  plan: FlightPlan;
}

export interface FlightProgress {
  from: string;
  to: string;
  progress: number;
}

export interface TravelScenario {
  id: string;
  title: string;
  description: string;
  source: string;
  destination: string;
  algorithm: TravelAlgorithm;
}

export const ALGORITHM_INFO: Record<TravelAlgorithm, { label: string; description: string; metric: string }> = {
  dijkstra: {
    label: 'Dijkstra',
    description: 'Finds the lowest total travel time by relaxing routes through a priority queue.',
    metric: 'Shortest time',
  },
  astar: {
    label: 'A* Search',
    description: 'Uses distance-to-destination as a heuristic to guide the priority queue.',
    metric: 'Guided shortest path',
  },
  bfs: {
    label: 'BFS',
    description: 'Ignores weights and searches by fewest airport connections.',
    metric: 'Fewest stops',
  },
  greedy: {
    label: 'Greedy',
    description: 'Always flies toward the airport geographically closest to the destination.',
    metric: 'Nearest-looking route',
  },
};
