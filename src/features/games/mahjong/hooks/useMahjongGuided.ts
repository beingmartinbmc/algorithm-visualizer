import { useState, useCallback } from 'react';
import type { TileCode, GuidedRound, Meld, WinResult } from '../types/mahjong';
import { generateWinningHand, generateRandomHand } from '../engine/tileManager';
import { solve } from '../engine/solver';
import { useMahjongSound } from './useMahjongSound';

function generateGuidedRound(): Pick<GuidedRound, 'hand' | 'isWinning' | 'solution'> {
  // 60% winning hands in guided mode to give more practice identifying groups
  if (Math.random() < 0.6) {
    const hand = generateWinningHand();
    const result = solve(hand);
    return { hand, isWinning: result.isWin, solution: result.isWin ? result : null };
  }
  for (let i = 0; i < 50; i++) {
    const hand = generateRandomHand();
    const result = solve(hand);
    if (!result.isWin) return { hand, isWinning: false, solution: null };
  }
  const hand = generateRandomHand();
  return { hand, isWinning: false, solution: null };
}

const INITIAL_ROUND: GuidedRound = {
  hand: [],
  isWinning: false,
  solution: null,
  phase: 'judging',
  playerSaidWin: null,
  selectedTiles: [],
  foundPair: null,
  foundMelds: [],
  hintsUsed: 0,
  showHint: false,
  feedback: null,
  roundComplete: false,
};

export function useMahjongGuided() {
  const [round, setRound] = useState<GuidedRound>(INITIAL_ROUND);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [started, setStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const sound = useMahjongSound();

  const startNewRound = useCallback(() => {
    const gen = generateGuidedRound();
    setRound({
      ...INITIAL_ROUND,
      hand: gen.hand,
      isWinning: gen.isWinning,
      solution: gen.solution,
    });
    setStarted(true);
  }, []);

  // Phase 1: Player judges Win / Not Win
  const judgeHand = useCallback((playerSaysWin: boolean) => {
    const correct = playerSaysWin === round.isWinning;

    if (correct && round.isWinning && round.solution) {
      // Correct + winning → move to grouping phase
      sound.playTilePlaced(5);
      setRound((prev) => ({
        ...prev,
        playerSaidWin: playerSaysWin,
        phase: 'grouping',
        feedback: 'Correct! Now identify the pair and melds.',
      }));
    } else if (correct && !round.isWinning) {
      // Correct + not winning → round done
      sound.playWinSound();
      setScore((s) => s + 100 - round.hintsUsed * 20);
      setTotalRounds((t) => t + 1);
      setCorrectRounds((c) => c + 1);
      setRound((prev) => ({
        ...prev,
        playerSaidWin: playerSaysWin,
        phase: 'feedback',
        feedback: 'Correct! This hand is not a winner.',
        roundComplete: true,
      }));
    } else {
      // Wrong
      sound.playLoseSound();
      setTotalRounds((t) => t + 1);
      setRound((prev) => ({
        ...prev,
        playerSaidWin: playerSaysWin,
        phase: 'feedback',
        feedback: round.isWinning
          ? 'Wrong — this hand IS a winner! Check the solution below.'
          : 'Wrong — this hand is NOT a winner.',
        roundComplete: true,
      }));
    }
  }, [round, sound]);

  // Phase 2: Player selects tiles to form groups
  const toggleTileSelection = useCallback((index: number) => {
    setRound((prev) => {
      const selected = prev.selectedTiles.includes(index)
        ? prev.selectedTiles.filter((i) => i !== index)
        : [...prev.selectedTiles, index];
      return { ...prev, selectedTiles: selected };
    });
    sound.playTilePlaced(3);
  }, [sound]);

  const submitPair = useCallback(() => {
    if (round.selectedTiles.length !== 2 || !round.solution) return;

    const tiles = round.selectedTiles.map((i) => round.hand[i]);
    const solPair = round.solution.pair;

    // Check if submitted pair matches solution pair (both same tile code)
    const isCorrectPair = tiles[0] === tiles[1] && tiles[0] === solPair[0];

    if (isCorrectPair) {
      sound.playTilePlaced(7);
      setRound((prev) => ({
        ...prev,
        foundPair: [tiles[0], tiles[1]] as [TileCode, TileCode],
        selectedTiles: [],
        feedback: 'Pair found! Now identify the 4 melds.',
      }));
    } else {
      sound.playErrorSound();
      setRound((prev) => ({
        ...prev,
        selectedTiles: [],
        feedback: 'That\'s not the correct pair. Try again!',
      }));
    }
  }, [round, sound]);

  const submitMeld = useCallback(() => {
    if (round.selectedTiles.length !== 3 || !round.solution) return;

    const tiles = round.selectedTiles.map((i) => round.hand[i]).sort() as TileCode[];

    // Check against remaining solution melds
    const remainingMelds = round.solution.melds.filter((_, idx) =>
      !round.foundMelds.some((fm) =>
        JSON.stringify(fm.tiles.sort()) === JSON.stringify(round.solution!.melds[idx].tiles.sort())
      )
    );

    const matchIdx = remainingMelds.findIndex((m) =>
      JSON.stringify([...m.tiles].sort()) === JSON.stringify(tiles)
    );

    if (matchIdx >= 0) {
      const matched = remainingMelds[matchIdx];
      sound.playTilePlaced(8);
      const newFoundMelds = [...round.foundMelds, matched];

      if (newFoundMelds.length === 4) {
        // All melds found!
        sound.playWinSound();
        setScore((s) => s + 200 - round.hintsUsed * 30);
        setTotalRounds((t) => t + 1);
        setCorrectRounds((c) => c + 1);
        setRound((prev) => ({
          ...prev,
          foundMelds: newFoundMelds,
          selectedTiles: [],
          phase: 'feedback',
          feedback: 'Excellent! You identified all groups correctly!',
          roundComplete: true,
        }));
      } else {
        setRound((prev) => ({
          ...prev,
          foundMelds: newFoundMelds,
          selectedTiles: [],
          feedback: `Meld ${newFoundMelds.length}/4 found! Keep going.`,
        }));
      }
    } else {
      sound.playErrorSound();
      setRound((prev) => ({
        ...prev,
        selectedTiles: [],
        feedback: 'Those 3 tiles don\'t form a valid meld in the solution. Try again!',
      }));
    }
  }, [round, sound]);

  const useHint = useCallback(() => {
    if (!round.solution) return;

    sound.playBacktrackSound();
    setRound((prev) => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      showHint: true,
    }));

    // Auto-hide hint after 3 seconds
    setTimeout(() => {
      setRound((prev) => ({ ...prev, showHint: false }));
    }, 3000);
  }, [round.solution, sound]);

  const skipGrouping = useCallback(() => {
    // Skip to feedback, showing the solution
    setTotalRounds((t) => t + 1);
    setRound((prev) => ({
      ...prev,
      phase: 'feedback',
      feedback: 'Skipped grouping. Here\'s the solution:',
      roundComplete: true,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setRound(INITIAL_ROUND);
    setScore(0);
    setTotalRounds(0);
    setCorrectRounds(0);
    setStarted(false);
  }, []);

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    sound.setEnabled(v);
  }, [sound]);

  return {
    round,
    score,
    totalRounds,
    correctRounds,
    started,
    soundEnabled,
    startNewRound,
    judgeHand,
    toggleTileSelection,
    submitPair,
    submitMeld,
    useHint,
    skipGrouping,
    resetGame,
    toggleSound,
  };
}
