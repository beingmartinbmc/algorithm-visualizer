import type { TileCode, Suit, Meld, SolveResult, SolverStep, StepAction } from '../types/mahjong';
import { SUITS } from '../types/mahjong';
import { parseTile } from './tileManager';

// ── Frequency helpers ────────────────────────────────────────────────────────

type SuitFreq = Record<number, number>;
type AllFreq = Record<Suit, SuitFreq>;

function buildAllFreq(hand: TileCode[]): AllFreq {
  const f: AllFreq = { B: {}, C: {}, D: {} };
  for (const t of hand) {
    const { suit, value } = parseTile(t);
    f[suit][value] = (f[suit][value] ?? 0) + 1;
  }
  return f;
}

function cloneFreq(f: AllFreq): AllFreq {
  const c: AllFreq = { B: {}, C: {}, D: {} };
  for (const s of SUITS) {
    for (const [k, v] of Object.entries(f[s])) {
      c[s][Number(k)] = v;
    }
  }
  return c;
}

function freqSnapshot(f: AllFreq): Record<string, number> {
  const snap: Record<string, number> = {};
  for (const s of SUITS) {
    for (const [k, v] of Object.entries(f[s])) {
      if (v > 0) snap[`${s}${k}`] = v;
    }
  }
  return snap;
}

function totalTiles(f: AllFreq): number {
  let sum = 0;
  for (const s of SUITS) {
    for (const v of Object.values(f[s])) sum += v;
  }
  return sum;
}

// ── Core backtracking meld solver ────────────────────────────────────────────
// Tries to decompose the remaining tiles into exactly `needed` melds.
// Works suit by suit, picking the smallest tile first.

function solveMelds(
  freq: AllFreq,
  needed: number,
  melds: Meld[],
  steps: SolverStep[] | null,
): boolean {
  if (needed === 0) return totalTiles(freq) === 0;

  // Find the smallest tile with count > 0
  for (const s of SUITS) {
    for (let v = 1; v <= 9; v++) {
      if ((freq[s][v] ?? 0) <= 0) continue;

      // ── Try Pong (AAA) ───────────────────────────────────
      if (freq[s][v] >= 3) {
        const tiles: TileCode[] = [`${s}${v}` as TileCode, `${s}${v}` as TileCode, `${s}${v}` as TileCode];
        freq[s][v] -= 3;

        if (steps) {
          steps.push({
            action: { type: 'try_meld', meldType: 'pong', tiles, success: true },
            description: `Try Pong: ${tiles.join(' ')}`,
            remaining: freqSnapshot(freq),
          });
        }

        melds.push({ type: 'pong', tiles });
        if (solveMelds(freq, needed - 1, melds, steps)) return true;
        melds.pop();
        freq[s][v] += 3;

        if (steps) {
          steps.push({
            action: { type: 'backtrack', tiles },
            description: `Backtrack: undo Pong ${tiles.join(' ')}`,
            remaining: freqSnapshot(freq),
          });
        }
      }

      // ── Try Chow (ABC) ───────────────────────────────────
      if (v <= 7 && (freq[s][v] ?? 0) >= 1 && (freq[s][v + 1] ?? 0) >= 1 && (freq[s][v + 2] ?? 0) >= 1) {
        const tiles: TileCode[] = [
          `${s}${v}` as TileCode,
          `${s}${v + 1}` as TileCode,
          `${s}${v + 2}` as TileCode,
        ];
        freq[s][v] -= 1;
        freq[s][v + 1] -= 1;
        freq[s][v + 2] -= 1;

        if (steps) {
          steps.push({
            action: { type: 'try_meld', meldType: 'chow', tiles, success: true },
            description: `Try Chow: ${tiles.join(' ')}`,
            remaining: freqSnapshot(freq),
          });
        }

        melds.push({ type: 'chow', tiles });
        if (solveMelds(freq, needed - 1, melds, steps)) return true;
        melds.pop();
        freq[s][v] += 1;
        freq[s][v + 1] += 1;
        freq[s][v + 2] += 1;

        if (steps) {
          steps.push({
            action: { type: 'backtrack', tiles },
            description: `Backtrack: undo Chow ${tiles.join(' ')}`,
            remaining: freqSnapshot(freq),
          });
        }
      }

      // If we reach here, the smallest tile could not form any meld → dead end
      return false;
    }
  }

  // No tiles left and needed === 0 was checked above
  return needed === 0;
}

// ── Main solver ──────────────────────────────────────────────────────────────
// Iterates over every possible pair, then tries to form 4 melds from the rest.

export function solve(hand: TileCode[]): SolveResult {
  const freq = buildAllFreq(hand);

  // Collect unique tiles that could be a pair (count >= 2)
  const pairCandidates: { suit: Suit; value: number }[] = [];
  for (const s of SUITS) {
    for (let v = 1; v <= 9; v++) {
      if ((freq[s][v] ?? 0) >= 2) pairCandidates.push({ suit: s, value: v });
    }
  }

  for (const { suit, value } of pairCandidates) {
    const trial = cloneFreq(freq);
    trial[suit][value] -= 2;

    const melds: Meld[] = [];
    if (solveMelds(trial, 4, melds, null)) {
      const pairCode = `${suit}${value}` as TileCode;
      return {
        isWin: true,
        pair: [pairCode, pairCode],
        melds,
      };
    }
  }

  return { isWin: false };
}

// ── Solver with animation steps ──────────────────────────────────────────────

export function solveWithSteps(hand: TileCode[]): { result: SolveResult; steps: SolverStep[] } {
  const freq = buildAllFreq(hand);
  const steps: SolverStep[] = [];

  const pairCandidates: { suit: Suit; value: number }[] = [];
  for (const s of SUITS) {
    for (let v = 1; v <= 9; v++) {
      if ((freq[s][v] ?? 0) >= 2) pairCandidates.push({ suit: s, value: v });
    }
  }

  for (const { suit, value } of pairCandidates) {
    const pairCode = `${suit}${value}` as TileCode;

    steps.push({
      action: { type: 'select_pair', pair: pairCode },
      description: `Try pair: ${pairCode} ${pairCode}`,
      remaining: freqSnapshot(freq),
    });

    const trial = cloneFreq(freq);
    trial[suit][value] -= 2;

    const melds: Meld[] = [];
    if (solveMelds(trial, 4, melds, steps)) {
      const winAction: StepAction = {
        type: 'found_win',
        pair: [pairCode, pairCode],
        melds: melds.map((m) => ({ ...m, tiles: [...m.tiles] })),
      };
      steps.push({
        action: winAction,
        description: `WIN! Pair: ${pairCode} ${pairCode} | Melds: ${melds.map((m) => m.tiles.join(' ')).join(' | ')}`,
        remaining: {},
      });

      return {
        result: { isWin: true, pair: [pairCode, pairCode], melds },
        steps,
      };
    }

    steps.push({
      action: { type: 'pair_failed', pair: pairCode },
      description: `Pair ${pairCode} ${pairCode} failed — no valid 4 melds found`,
      remaining: freqSnapshot(freq),
    });
  }

  steps.push({
    action: { type: 'no_win' },
    description: 'No valid winning combination found.',
    remaining: freqSnapshot(freq),
  });

  return { result: { isWin: false }, steps };
}
