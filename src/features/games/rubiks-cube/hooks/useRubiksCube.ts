import { useCallback, useMemo, useRef, useState } from 'react';
import type { Challenge, CubeMove, RubiksMode, SimulationResult, SolutionStep } from '../types/rubiksCube';
import { applyMove, applyMoves, createSolvedCube, isSolved, solveFromHistory } from '../engine/cube';
import { CHALLENGES, formatMoves, generateScramble, parseMove, parseMoveSequence, runSimulation } from '../engine/scramble';
import { useRubiksCubeSound } from './useRubiksCubeSound';

const GUIDED_SCRIPT = [
  'Start from a solved cube and watch what a single R turn does.',
  'Scramble the cube with a short sequence.',
  'Ask the solver for the inverse sequence.',
  'Step through solution moves and watch the cube return to solved state.',
];

export function useRubiksCube() {
  const [mode, setMode] = useState<RubiksMode>('guided');
  const [cube, setCube] = useState(createSolvedCube);
  const [moveHistory, setMoveHistory] = useState<CubeMove[]>([]);
  const [scrambleMoves, setScrambleMoves] = useState<CubeMove[]>([]);
  const [solution, setSolution] = useState<SolutionStep[]>([]);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [manualMove, setManualMove] = useState('R');
  const [customScramble, setCustomScramble] = useState("R U R' U'");
  const [simulationRuns, setSimulationRuns] = useState(10);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [message, setMessage] = useState('Choose a mode and start turning the cube.');
  const [guidedStep, setGuidedStep] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeMoves, setChallengeMoves] = useState(0);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const autoTimerRef = useRef<number | null>(null);
  const sound = useRubiksCubeSound();

  const solved = useMemo(() => isSolved(cube), [cube]);
  const solutionDone = solution.length > 0 && solutionIndex >= solution.length;

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const resetCube = useCallback(() => {
    clearAutoTimer();
    setCube(createSolvedCube());
    setMoveHistory([]);
    setScrambleMoves([]);
    setSolution([]);
    setSolutionIndex(0);
    setSimulationResult(null);
    setGuidedStep(0);
    setChallengeStarted(false);
    setChallengeMoves(0);
    setChallengeSolved(false);
    setMessage('Cube reset to solved state.');
  }, [clearAutoTimer]);

  const switchMode = useCallback((nextMode: RubiksMode) => {
    setMode(nextMode);
    clearAutoTimer();
    setCube(createSolvedCube());
    setMoveHistory([]);
    setScrambleMoves([]);
    setSolution([]);
    setSolutionIndex(0);
    setSimulationResult(null);
    setGuidedStep(0);
    setChallengeStarted(false);
    setChallengeMoves(0);
    setChallengeSolved(false);
    setMessage(
      nextMode === 'guided'
        ? 'Guided mode: follow the walkthrough to understand cube moves and solving.'
        : nextMode === 'freeplay'
          ? 'Freeplay mode: scramble, turn, and solve however you like.'
          : 'Challenge mode: solve the scramble in as few moves as possible.',
    );
  }, [clearAutoTimer]);

  const makeMove = useCallback((move: CubeMove, record = true) => {
    setCube((current) => {
      const next = applyMove(current, move);
      if (record) {
        setMoveHistory((history) => [...history, move]);
        if (mode === 'challenge' && challengeStarted && !challengeSolved) {
          setChallengeMoves((count) => count + 1);
          if (isSolved(next)) {
            setChallengeSolved(true);
            setMessage('Challenge solved! Compare your move count with the target.');
            sound.playSolved();
          }
        }
      }
      return next;
    });
    setSolution([]);
    setSolutionIndex(0);
    setSimulationResult(null);
    sound.playMove(move.charCodeAt(0));
  }, [challengeSolved, challengeStarted, mode, sound]);

  const runScramble = useCallback((length = 12) => {
    clearAutoTimer();
    const scramble = generateScramble(length);
    setCube(applyMoves(createSolvedCube(), scramble));
    setMoveHistory(scramble);
    setScrambleMoves(scramble);
    setSolution([]);
    setSolutionIndex(0);
    setChallengeStarted(false);
    setChallengeMoves(0);
    setChallengeSolved(false);
    setMessage(`Scrambled with: ${formatMoves(scramble)}`);
    sound.playScramble();
  }, [clearAutoTimer, sound]);

  const runCustomScramble = useCallback(() => {
    clearAutoTimer();
    const parsed = parseMoveSequence(customScramble);
    if (!parsed) {
      setMessage("Invalid scramble. Use moves like: R U R' U' or Ri U R U2.");
      sound.playError();
      return;
    }

    setCube(applyMoves(createSolvedCube(), parsed));
    setMoveHistory(parsed);
    setScrambleMoves(parsed);
    setSolution([]);
    setSolutionIndex(0);
    setSimulationResult(null);
    setChallengeStarted(false);
    setChallengeMoves(0);
    setChallengeSolved(false);
    setMessage(`Custom scramble applied: ${formatMoves(parsed)}`);
    sound.playScramble();
  }, [clearAutoTimer, customScramble, sound]);

  const startChallenge = useCallback((challenge: Challenge = selectedChallenge) => {
    clearAutoTimer();
    setSelectedChallenge(challenge);
    setCube(applyMoves(createSolvedCube(), challenge.scramble));
    setMoveHistory(challenge.scramble);
    setScrambleMoves(challenge.scramble);
    setSolution([]);
    setSolutionIndex(0);
    setSimulationResult(null);
    setChallengeStarted(true);
    setChallengeMoves(0);
    setChallengeSolved(false);
    setMessage(`Challenge started. Scramble: ${formatMoves(challenge.scramble)}`);
    sound.playScramble();
  }, [clearAutoTimer, selectedChallenge, sound]);

  const generateSolution = useCallback(() => {
    const steps = solveFromHistory(moveHistory);
    setSolution(steps);
    setSolutionIndex(0);
    setSimulationResult(null);
    setMessage(
      steps.length > 0
        ? `Solver found ${steps.length} inverse move${steps.length === 1 ? '' : 's'}.`
        : 'Cube is already solved.',
    );
    if (steps.length === 0) sound.playSolved();
  }, [moveHistory, sound]);

  const stepSolution = useCallback(() => {
    const step = solution[solutionIndex];
    if (!step) return;

    setCube((current) => {
      const next = applyMove(current, step.move);
      if (isSolved(next)) {
        setMessage('Solved! The inverse sequence returned the cube to its original state.');
        sound.playSolved();
      } else {
        setMessage(step.description);
      }
      return next;
    });
    setSolutionIndex((index) => index + 1);
    sound.playMove(solutionIndex);
  }, [solution, solutionIndex, sound]);

  const autoSolve = useCallback(() => {
    clearAutoTimer();
    if (solution.length === 0) {
      const steps = solveFromHistory(moveHistory);
      setSolution(steps);
      setSolutionIndex(0);
      if (steps.length === 0) return;
    }

    autoTimerRef.current = window.setInterval(() => {
      setSolutionIndex((currentIndex) => {
        const currentSolution = solution.length > 0 ? solution : solveFromHistory(moveHistory);
        const step = currentSolution[currentIndex];
        if (!step) {
          clearAutoTimer();
          return currentIndex;
        }
        setCube((currentCube) => {
          const next = applyMove(currentCube, step.move);
          if (isSolved(next)) {
            setMessage('Auto-solve complete.');
            sound.playSolved();
            clearAutoTimer();
          } else {
            sound.playMove(currentIndex);
          }
          return next;
        });
        return currentIndex + 1;
      });
    }, 450);
  }, [clearAutoTimer, moveHistory, solution, sound]);

  const applyManualMove = useCallback(() => {
    const parsed = parseMove(manualMove);
    if (!parsed) {
      setMessage("Invalid move. Use notation like R, U', F2, or L'.");
      sound.playError();
      return;
    }
    makeMove(parsed);
    setMessage(`Applied ${parsed}.`);
  }, [makeMove, manualMove, sound]);

  const simulateSolves = useCallback(() => {
    const result = runSimulation(simulationRuns);
    setSimulationResult(result);
    setMessage(
      `Ran ${result.runs} simulated solves. Best: ${result.best.solutionLength} moves, worst: ${result.worst.solutionLength} moves.`,
    );
  }, [simulationRuns]);

  const undoLastMove = useCallback(() => {
    const previous = moveHistory.slice(0, -1);
    setMoveHistory(previous);
    setCube(applyMoves(createSolvedCube(), previous));
    setSolution([]);
    setSolutionIndex(0);
    setMessage('Undid the last recorded move.');
  }, [moveHistory]);

  const nextGuidedStep = useCallback(() => {
    if (guidedStep === 0) {
      makeMove('R');
      setMessage('R turns the right face clockwise. Notice the side stickers move too.');
    } else if (guidedStep === 1) {
      const scramble: CubeMove[] = ['R', 'U', "R'", "U'"];
      setCube(applyMoves(createSolvedCube(), scramble));
      setMoveHistory(scramble);
      setScrambleMoves(scramble);
      setMessage(`Short scramble applied: ${formatMoves(scramble)}`);
      sound.playScramble();
    } else if (guidedStep === 2) {
      const steps = solveFromHistory(moveHistory);
      setSolution(steps);
      setSolutionIndex(0);
      setMessage(`The solver reverses the scramble: ${formatMoves(steps.map((step) => step.move))}`);
    } else {
      stepSolution();
    }
    setGuidedStep((step) => Math.min(step + 1, GUIDED_SCRIPT.length - 1));
  }, [guidedStep, makeMove, moveHistory, sound, stepSolution]);

  return {
    mode,
    cube,
    solved,
    moveHistory,
    scrambleMoves,
    solution,
    solutionIndex,
    solutionDone,
    manualMove,
    setManualMove,
    customScramble,
    setCustomScramble,
    simulationRuns,
    setSimulationRuns,
    simulationResult,
    message,
    guidedStep,
    guidedScript: GUIDED_SCRIPT,
    selectedChallenge,
    setSelectedChallenge,
    challenges: CHALLENGES,
    challengeStarted,
    challengeMoves,
    challengeSolved,
    soundEnabled: sound.soundEnabled,
    toggleSound: sound.toggleSound,
    switchMode,
    resetCube,
    makeMove,
    runScramble,
    runCustomScramble,
    generateSolution,
    stepSolution,
    autoSolve,
    applyManualMove,
    undoLastMove,
    startChallenge,
    nextGuidedStep,
    simulateSolves,
  };
}
