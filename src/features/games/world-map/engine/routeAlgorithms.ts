import type { Airport, AlgorithmResult, AlgorithmStep, FlightPlan, FlightRoute, TravelAlgorithm } from '../types/worldMap';

interface QueueNode {
  code: string;
  priority: number;
}

export function getAirportMap(airports: Airport[]) {
  return new Map(airports.map((airport) => [airport.code, airport]));
}

export function getNeighbors(routes: FlightRoute[], code: string): { code: string; route: FlightRoute }[] {
  return routes.flatMap((route) => {
    if (route.source === code) return [{ code: route.destination, route }];
    if (route.destination === code) return [{ code: route.source, route }];
    return [];
  });
}

export function getRouteBetween(routes: FlightRoute[], a: string, b: string): FlightRoute | null {
  return routes.find((route) => (
    (route.source === a && route.destination === b) || (route.source === b && route.destination === a)
  )) ?? null;
}

export function runTravelAlgorithm(
  airports: Airport[],
  routes: FlightRoute[],
  source: string,
  destination: string,
  algorithm: TravelAlgorithm,
): AlgorithmResult {
  if (algorithm === 'bfs') return runBfs(airports, routes, source, destination);
  if (algorithm === 'greedy') return runGreedy(airports, routes, source, destination);
  return runWeightedSearch(airports, routes, source, destination, algorithm);
}

function runWeightedSearch(
  airports: Airport[],
  routes: FlightRoute[],
  source: string,
  destination: string,
  algorithm: Extract<TravelAlgorithm, 'dijkstra' | 'astar'>,
): AlgorithmResult {
  const airportMap = getAirportMap(airports);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: QueueNode[] = [{ code: source, priority: 0 }];
  const steps: AlgorithmStep[] = [];

  for (const airport of airports) {
    distances[airport.code] = airport.code === source ? 0 : Infinity;
    previous[airport.code] = null;
  }

  steps.push(snapshot('init', source, `Start at ${source}. Set its travel time to 0 and every other airport to infinity.`, visited, queue, distances, previous));

  while (queue.length > 0) {
    queue.sort((a, b) => a.priority - b.priority);
    const current = queue.shift()!;
    if (visited.has(current.code)) continue;

    visited.add(current.code);
    steps.push(snapshot('select', current.code, `Select ${current.code}, the airport with the best current priority.`, visited, queue, distances, previous));

    if (current.code === destination) break;

    for (const neighbor of getNeighbors(routes, current.code)) {
      if (visited.has(neighbor.code)) continue;
      const newDistance = distances[current.code] + neighbor.route.durationHours;

      if (newDistance < distances[neighbor.code]) {
        distances[neighbor.code] = Math.round(newDistance * 10) / 10;
        previous[neighbor.code] = current.code;
        const heuristic = algorithm === 'astar'
          ? estimateHours(airportMap.get(neighbor.code), airportMap.get(destination))
          : 0;
        queue.push({ code: neighbor.code, priority: Math.round((newDistance + heuristic) * 10) / 10 });
        steps.push(snapshot(
          'relax',
          neighbor.code,
          `${current.code} -> ${neighbor.code} improves the route to ${distances[neighbor.code]}h.`,
          visited,
          queue,
          distances,
          previous,
          { from: current.code, to: neighbor.code },
        ));
      } else {
        steps.push(snapshot(
          'dead-end',
          neighbor.code,
          `${current.code} -> ${neighbor.code} is slower than the best known route.`,
          visited,
          queue,
          distances,
          previous,
          { from: current.code, to: neighbor.code },
        ));
      }
    }
  }

  const path = reconstructPath(previous, source, destination);
  const plan = buildPlan(routes, path);
  steps.push(snapshot('done', destination, `Route complete: ${path.join(' -> ')}`, visited, queue, distances, previous, undefined, path));
  return { steps, plan };
}

function runBfs(airports: Airport[], routes: FlightRoute[], source: string, destination: string): AlgorithmResult {
  const visited = new Set<string>([source]);
  const previous: Record<string, string | null> = {};
  const distances: Record<string, number> = {};
  const queue: QueueNode[] = [{ code: source, priority: 0 }];
  const steps: AlgorithmStep[] = [];

  for (const airport of airports) {
    previous[airport.code] = null;
    distances[airport.code] = airport.code === source ? 0 : Infinity;
  }

  steps.push(snapshot('init', source, `Start BFS at ${source}. Each edge counts as one airport hop.`, visited, queue, distances, previous));

  while (queue.length > 0) {
    const current = queue.shift()!;
    steps.push(snapshot('select', current.code, `Visit ${current.code} and enqueue all unseen connected airports.`, visited, queue, distances, previous));
    if (current.code === destination) break;

    for (const neighbor of getNeighbors(routes, current.code)) {
      if (visited.has(neighbor.code)) continue;
      visited.add(neighbor.code);
      previous[neighbor.code] = current.code;
      distances[neighbor.code] = distances[current.code] + 1;
      queue.push({ code: neighbor.code, priority: distances[neighbor.code] });
      steps.push(snapshot('enqueue', neighbor.code, `Add ${neighbor.code} to the BFS queue at hop ${distances[neighbor.code]}.`, visited, queue, distances, previous, { from: current.code, to: neighbor.code }));
    }
  }

  const path = reconstructPath(previous, source, destination);
  const plan = buildPlan(routes, path);
  steps.push(snapshot('done', destination, `Fewest-stop route complete: ${path.join(' -> ')}`, visited, queue, distances, previous, undefined, path));
  return { steps, plan };
}

function runGreedy(airports: Airport[], routes: FlightRoute[], source: string, destination: string): AlgorithmResult {
  const airportMap = getAirportMap(airports);
  const visited = new Set<string>();
  const previous: Record<string, string | null> = {};
  const distances: Record<string, number> = {};
  const steps: AlgorithmStep[] = [];
  let current = source;

  for (const airport of airports) {
    previous[airport.code] = null;
    distances[airport.code] = airport.code === source ? 0 : Infinity;
  }

  steps.push(snapshot('init', source, `Start greedy routing at ${source}. Always choose the neighbor closest to ${destination}.`, visited, [{ code: source, priority: 0 }], distances, previous));

  while (current !== destination) {
    visited.add(current);
    const options = getNeighbors(routes, current)
      .filter((neighbor) => !visited.has(neighbor.code))
      .sort((a, b) => estimateHours(airportMap.get(a.code), airportMap.get(destination)) - estimateHours(airportMap.get(b.code), airportMap.get(destination)));

    steps.push(snapshot('select', current, `From ${current}, compare nearby hubs by straight-line distance to ${destination}.`, visited, options.map((item) => ({ code: item.code, priority: Math.round(estimateHours(airportMap.get(item.code), airportMap.get(destination)) * 10) / 10 })), distances, previous));

    if (options.length === 0) break;
    const next = options[0];
    distances[next.code] = Math.round((distances[current] + next.route.durationHours) * 10) / 10;
    previous[next.code] = current;
    steps.push(snapshot('relax', next.code, `Greedy picks ${next.code} as the closest-looking next airport.`, visited, [], distances, previous, { from: current, to: next.code }));
    current = next.code;
  }

  const path = reconstructPath(previous, source, destination);
  const plan = buildPlan(routes, path);
  steps.push(snapshot('done', destination, `Greedy route complete: ${path.join(' -> ')}`, visited, [], distances, previous, undefined, path));
  return { steps, plan };
}

function snapshot(
  type: AlgorithmStep['type'],
  airportCode: string,
  description: string,
  visited: Set<string>,
  queue: QueueNode[],
  distances: Record<string, number>,
  previous: Record<string, string | null>,
  relaxedRoute?: { from: string; to: string },
  route?: string[],
): AlgorithmStep {
  return {
    type,
    airportCode,
    description,
    visited: Array.from(visited),
    frontier: queue.map((item) => ({ code: item.code, priority: item.priority })),
    distances: { ...distances },
    previous: { ...previous },
    relaxedRoute,
    route,
  };
}

function reconstructPath(previous: Record<string, string | null>, source: string, destination: string): string[] {
  const path: string[] = [];
  let cursor: string | null = destination;
  while (cursor) {
    path.unshift(cursor);
    if (cursor === source) break;
    cursor = previous[cursor];
  }
  return path[0] === source ? path : [];
}

export function buildPlan(routes: FlightRoute[], path: string[]): FlightPlan {
  let totalDistanceKm = 0;
  let totalDurationHours = 0;
  let totalCostUsd = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const route = getRouteBetween(routes, path[i], path[i + 1]);
    if (!route) continue;
    totalDistanceKm += route.distanceKm;
    totalDurationHours += route.durationHours;
    totalCostUsd += route.costUsd;
  }
  return {
    path,
    totalDistanceKm,
    totalDurationHours: Math.round(totalDurationHours * 10) / 10,
    totalCostUsd,
    stops: Math.max(0, path.length - 2),
  };
}

function estimateHours(a?: Airport, b?: Airport): number {
  if (!a || !b) return 0;
  const dx = a.lon - b.lon;
  const dy = a.lat - b.lat;
  const roughKm = Math.sqrt(dx * dx + dy * dy) * 96;
  return roughKm / 870;
}
