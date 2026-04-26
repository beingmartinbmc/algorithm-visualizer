import { useCallback, useMemo, useRef, useState } from 'react';
import { AIRPORTS, FLIGHT_ROUTES, TRAVEL_SCENARIOS } from '../data/airportNetwork';
import { getRouteBetween, runTravelAlgorithm } from '../engine/routeAlgorithms';
import type { AlgorithmResult, FlightProgress, SimulationPhase, TravelAlgorithm } from '../types/worldMap';

export function useWorldMapSimulator() {
  const [source, setSource] = useState('JFK');
  const [destination, setDestination] = useState('HND');
  const [algorithm, setAlgorithm] = useState<TravelAlgorithm>('dijkstra');
  const [result, setResult] = useState<AlgorithmResult>(() => runTravelAlgorithm(AIRPORTS, FLIGHT_ROUTES, 'JFK', 'HND', 'dijkstra'));
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<SimulationPhase>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [flightProgress, setFlightProgress] = useState<FlightProgress | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentStep = result.steps[stepIndex] ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const planRoute = useCallback((nextSource = source, nextDestination = destination, nextAlgorithm = algorithm) => {
    clearTimer();
    const nextResult = runTravelAlgorithm(AIRPORTS, FLIGHT_ROUTES, nextSource, nextDestination, nextAlgorithm);
    setResult(nextResult);
    setStepIndex(0);
    setPhase('planning');
    setIsPlaying(false);
    setFlightProgress(null);
  }, [algorithm, clearTimer, destination, source]);

  const changeSource = useCallback((code: string) => {
    if (code === destination) return;
    setSource(code);
    planRoute(code, destination, algorithm);
  }, [algorithm, destination, planRoute]);

  const changeDestination = useCallback((code: string) => {
    if (code === source) return;
    setDestination(code);
    planRoute(source, code, algorithm);
  }, [algorithm, planRoute, source]);

  const changeAlgorithm = useCallback((nextAlgorithm: TravelAlgorithm) => {
    setAlgorithm(nextAlgorithm);
    planRoute(source, destination, nextAlgorithm);
  }, [destination, planRoute, source]);

  const loadScenario = useCallback((id: string) => {
    const scenario = TRAVEL_SCENARIOS.find((item) => item.id === id);
    if (!scenario) return;
    setSource(scenario.source);
    setDestination(scenario.destination);
    setAlgorithm(scenario.algorithm);
    planRoute(scenario.source, scenario.destination, scenario.algorithm);
  }, [planRoute]);

  const stepForward = useCallback(() => {
    setPhase('planning');
    setStepIndex((index) => Math.min(index + 1, result.steps.length - 1));
  }, [result.steps.length]);

  const stepBack = useCallback(() => {
    setPhase('planning');
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const animateFlight = useCallback(() => {
    clearTimer();
    const path = result.plan.path;
    if (path.length < 2) return;
    setPhase('flying');
    setIsPlaying(true);

    let segment = 0;
    let progress = 0;
    setFlightProgress({ from: path[0], to: path[1], progress: 0 });

    timerRef.current = window.setInterval(() => {
      progress += 0.045;
      if (progress >= 1) {
        segment += 1;
        progress = 0;
        if (segment >= path.length - 1) {
          clearTimer();
          setFlightProgress(null);
          setIsPlaying(false);
          setPhase('complete');
          return;
        }
      }
      setFlightProgress({ from: path[segment], to: path[segment + 1], progress });
    }, 80);
  }, [clearTimer, result.plan.path]);

  const playPlanning = useCallback(() => {
    if (isPlaying) {
      clearTimer();
      setIsPlaying(false);
      return;
    }

    setPhase('planning');
    setIsPlaying(true);
    timerRef.current = window.setInterval(() => {
      setStepIndex((index) => {
        if (index >= result.steps.length - 1) {
          clearTimer();
          setIsPlaying(false);
          animateFlight();
          return index;
        }
        return index + 1;
      });
    }, 420);
  }, [animateFlight, clearTimer, isPlaying, result.steps.length]);

  const activeRoute = useMemo(() => {
    const path = currentStep?.route ?? result.plan.path;
    return path.slice(0, -1).map((code, index) => getRouteBetween(FLIGHT_ROUTES, code, path[index + 1])).filter(Boolean);
  }, [currentStep?.route, result.plan.path]);

  return {
    airports: AIRPORTS,
    routes: FLIGHT_ROUTES,
    scenarios: TRAVEL_SCENARIOS,
    source,
    destination,
    algorithm,
    result,
    currentStep,
    stepIndex,
    phase,
    isPlaying,
    flightProgress,
    activeRoute,
    changeSource,
    changeDestination,
    changeAlgorithm,
    loadScenario,
    planRoute,
    stepForward,
    stepBack,
    playPlanning,
    animateFlight,
  };
}
