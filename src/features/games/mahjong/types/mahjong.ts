// ── Tile System ──────────────────────────────────────────────────────────────

export type Suit = 'B' | 'C' | 'D';

export const SUIT_NAMES: Record<Suit, string> = {
  B: 'Bamboo',
  C: 'Characters',
  D: 'Dots',
};

export const SUIT_COLORS: Record<Suit, string> = {
  B: '#4ade80',   // green
  C: '#f87171',   // red
  D: '#60a5fa',   // blue
};

/** Compact tile code, e.g. "B1", "C9", "D5" */
export type TileCode = `${Suit}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export interface Tile {
  suit: Suit;
  value: number; // 1–9
  code: TileCode;
}

// ── Meld / Grouping ─────────────────────────────────────────────────────────

export type MeldType = 'pong' | 'chow';

export interface Meld {
  type: MeldType;
  tiles: TileCode[];
}

export interface WinResult {
  isWin: true;
  pair: [TileCode, TileCode];
  melds: Meld[];
}

export interface LoseResult {
  isWin: false;
}

export type SolveResult = WinResult | LoseResult;

// ── Solver Step (for animation) ──────────────────────────────────────────────

export type StepAction =
  | { type: 'select_pair'; pair: TileCode }
  | { type: 'try_meld'; meldType: MeldType; tiles: TileCode[]; success: boolean }
  | { type: 'backtrack'; tiles: TileCode[] }
  | { type: 'found_win'; pair: [TileCode, TileCode]; melds: Meld[] }
  | { type: 'pair_failed'; pair: TileCode }
  | { type: 'no_win' };

export interface SolverStep {
  action: StepAction;
  description: string;
  remaining: Record<string, number>; // frequency snapshot
}

// ── Game State ───────────────────────────────────────────────────────────────

export interface MahjongGameState {
  hand: TileCode[];
  result: SolveResult | null;
  steps: SolverStep[];
  stepIndex: number;
  isAnimating: boolean;
  animSpeed: number;
  lastError: string | null;
}

export const HAND_SIZE = 14;
export const MAX_COPIES = 4;
export const TILE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const SUITS: Suit[] = ['B', 'C', 'D'];

export const GAME_DESCRIPTION = {
  title: 'Mahjong Hand Solver',
  subtitle: 'Backtracking-based winning hand validator',
  what: 'Build a 14-tile Mahjong hand and check if it forms a valid winning combination — 4 melds (pongs or chows) plus 1 pair. Watch the backtracking solver try every possibility step-by-step.',
  skills: [
    'Backtracking',
    'Constraint Validation',
    'Combinatorics',
    'Pattern Matching',
  ],
};
