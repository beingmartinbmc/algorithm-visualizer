import { useState, useCallback } from 'react';
import type { TileCode, TwoPlayerState, PlayerState, SolveResult } from '../types/mahjong';
import { HAND_SIZE } from '../types/mahjong';
import { sortHand, canAddTile } from '../engine/tileManager';
import { solve } from '../engine/solver';
import { useMahjongSound } from './useMahjongSound';

function freshPlayer(name: string): PlayerState {
  return { name, hand: [], result: null, score: 0 };
}

const INITIAL: TwoPlayerState = {
  phase: 'building',
  players: [freshPlayer('Player 1'), freshPlayer('Player 2')],
  currentPlayer: 0,
  round: 1,
  roundComplete: false,
};

export function useMahjongTwoPlayer() {
  const [state, setState] = useState<TwoPlayerState>(INITIAL);
  const [lastError, setLastError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const sound = useMahjongSound();

  const currentHand = state.players[state.currentPlayer].hand;
  const currentHandIsFull = currentHand.length >= HAND_SIZE;
  const bothFull = state.players[0].hand.length >= HAND_SIZE && state.players[1].hand.length >= HAND_SIZE;

  const startGame = useCallback(() => {
    setState({ ...INITIAL });
    setStarted(true);
    setLastError(null);
  }, []);

  const addTile = useCallback((tile: TileCode) => {
    if (state.phase !== 'building') return;

    const hand = state.players[state.currentPlayer].hand;
    const err = canAddTile(hand, tile);
    if (err) {
      setLastError(err);
      sound.playErrorSound();
      return;
    }
    setLastError(null);

    const { value } = { value: Number(tile[1]) };
    sound.playTilePlaced(value);

    setState((prev) => {
      const newPlayers = [...prev.players] as [PlayerState, PlayerState];
      const p = { ...newPlayers[prev.currentPlayer] };
      p.hand = sortHand([...p.hand, tile]);
      newPlayers[prev.currentPlayer] = p;

      // Auto-switch player if hand is now full
      const handNowFull = p.hand.length >= HAND_SIZE;
      const otherFull = newPlayers[1 - prev.currentPlayer].hand.length >= HAND_SIZE;

      let nextPlayer = prev.currentPlayer;
      if (handNowFull && !otherFull) {
        nextPlayer = (1 - prev.currentPlayer) as 0 | 1;
      } else if (!handNowFull) {
        // Alternate turns
        nextPlayer = (1 - prev.currentPlayer) as 0 | 1;
        // But skip if the other player is already full
        if (newPlayers[nextPlayer].hand.length >= HAND_SIZE) {
          nextPlayer = prev.currentPlayer;
        }
      }

      return { ...prev, players: newPlayers, currentPlayer: nextPlayer };
    });
  }, [state.phase, state.currentPlayer, state.players, sound]);

  const removeTile = useCallback((index: number) => {
    if (state.phase !== 'building') return;
    sound.playTileRemoved();
    setLastError(null);

    setState((prev) => {
      const newPlayers = [...prev.players] as [PlayerState, PlayerState];
      const p = { ...newPlayers[prev.currentPlayer] };
      const newHand = [...p.hand];
      newHand.splice(index, 1);
      p.hand = newHand;
      newPlayers[prev.currentPlayer] = p;
      return { ...prev, players: newPlayers };
    });
  }, [state.phase, state.currentPlayer, sound]);

  const checkBothHands = useCallback(() => {
    if (!bothFull) return;

    const result0 = solve(state.players[0].hand);
    const result1 = solve(state.players[1].hand);

    const score0 = result0.isWin ? 1 : 0;
    const score1 = result1.isWin ? 1 : 0;

    if (score0 > score1 || score1 > score0) {
      sound.playWinSound();
    } else {
      sound.playLoseSound();
    }

    setState((prev) => {
      const newPlayers = [...prev.players] as [PlayerState, PlayerState];
      newPlayers[0] = { ...newPlayers[0], result: result0, score: newPlayers[0].score + score0 };
      newPlayers[1] = { ...newPlayers[1], result: result1, score: newPlayers[1].score + score1 };
      return { ...prev, players: newPlayers, phase: 'results', roundComplete: true };
    });
  }, [bothFull, state.players, sound]);

  const nextRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'building',
      players: [
        { ...prev.players[0], hand: [], result: null },
        { ...prev.players[1], hand: [], result: null },
      ],
      currentPlayer: 0,
      round: prev.round + 1,
      roundComplete: false,
    }));
    setLastError(null);
  }, []);

  const resetGame = useCallback(() => {
    setState(INITIAL);
    setStarted(false);
    setLastError(null);
  }, []);

  const switchPlayer = useCallback(() => {
    if (state.phase !== 'building') return;
    const other = (1 - state.currentPlayer) as 0 | 1;
    if (state.players[other].hand.length >= HAND_SIZE) return;
    setState((prev) => ({ ...prev, currentPlayer: other }));
  }, [state.phase, state.currentPlayer, state.players]);

  const getWinner = (): string | null => {
    if (state.phase !== 'results') return null;
    const r0 = state.players[0].result;
    const r1 = state.players[1].result;
    if (!r0 || !r1) return null;
    if (r0.isWin && !r1.isWin) return state.players[0].name;
    if (!r0.isWin && r1.isWin) return state.players[1].name;
    if (r0.isWin && r1.isWin) return 'Both Win!';
    return 'Neither Wins';
  };

  const toggleSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    sound.setEnabled(v);
  }, [sound]);

  return {
    state,
    lastError,
    started,
    soundEnabled,
    currentHand,
    currentHandIsFull,
    bothFull,
    winner: getWinner(),
    startGame,
    addTile,
    removeTile,
    checkBothHands,
    nextRound,
    resetGame,
    switchPlayer,
    toggleSound,
  };
}
