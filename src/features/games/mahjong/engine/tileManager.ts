import type { TileCode, Suit } from '../types/mahjong';
import { SUITS, TILE_VALUES, HAND_SIZE, MAX_COPIES } from '../types/mahjong';

// ── All valid tile codes ─────────────────────────────────────────────────────

export const ALL_TILES: TileCode[] = SUITS.flatMap((s) =>
  TILE_VALUES.map((v) => `${s}${v}` as TileCode),
);

// ── Parsing ──────────────────────────────────────────────────────────────────

export function parseTile(code: TileCode): { suit: Suit; value: number } {
  return { suit: code[0] as Suit, value: Number(code[1]) };
}

// ── Frequency table ──────────────────────────────────────────────────────────

export type FreqTable = Record<string, number>;

/** Build a frequency map from a hand array. Keys are TileCodes. */
export function buildFrequency(hand: TileCode[]): FreqTable {
  const freq: FreqTable = {};
  for (const t of hand) {
    freq[t] = (freq[t] ?? 0) + 1;
  }
  return freq;
}

/** Build per-suit frequency maps. Keys are numeric strings "1"–"9". */
export function buildSuitFrequency(hand: TileCode[]): Record<Suit, Record<number, number>> {
  const result: Record<Suit, Record<number, number>> = { B: {}, C: {}, D: {} };
  for (const t of hand) {
    const { suit, value } = parseTile(t);
    result[suit][value] = (result[suit][value] ?? 0) + 1;
  }
  return result;
}

// ── Sorting ──────────────────────────────────────────────────────────────────

const SUIT_ORDER: Record<Suit, number> = { B: 0, C: 1, D: 2 };

export function sortHand(hand: TileCode[]): TileCode[] {
  return [...hand].sort((a, b) => {
    const sa = SUIT_ORDER[a[0] as Suit];
    const sb = SUIT_ORDER[b[0] as Suit];
    if (sa !== sb) return sa - sb;
    return Number(a[1]) - Number(b[1]);
  });
}

// ── Validation ───────────────────────────────────────────────────────────────

export function validateHand(hand: TileCode[]): string | null {
  if (hand.length === 0) return 'Hand is empty. Add 14 tiles.';
  if (hand.length < HAND_SIZE) return `Hand has ${hand.length} tiles. Need exactly ${HAND_SIZE}.`;
  if (hand.length > HAND_SIZE) return `Hand has ${hand.length} tiles. Maximum is ${HAND_SIZE}.`;

  const freq = buildFrequency(hand);
  for (const [code, count] of Object.entries(freq)) {
    if (count > MAX_COPIES) return `Too many copies of ${code} (${count}). Maximum is ${MAX_COPIES}.`;
  }

  return null;
}

export function canAddTile(hand: TileCode[], tile: TileCode): string | null {
  if (hand.length >= HAND_SIZE) return `Hand is full (${HAND_SIZE} tiles).`;
  const count = hand.filter((t) => t === tile).length;
  if (count >= MAX_COPIES) return `Already have ${MAX_COPIES} copies of ${tile}.`;
  return null;
}

// ── Random hand generator ────────────────────────────────────────────────────

export function generateRandomHand(): TileCode[] {
  const freq: FreqTable = {};
  const hand: TileCode[] = [];

  while (hand.length < HAND_SIZE) {
    const tile = ALL_TILES[Math.floor(Math.random() * ALL_TILES.length)];
    if ((freq[tile] ?? 0) < MAX_COPIES) {
      hand.push(tile);
      freq[tile] = (freq[tile] ?? 0) + 1;
    }
  }

  return sortHand(hand);
}

/** Generate a random hand that is guaranteed to be a winning hand. */
export function generateWinningHand(): TileCode[] {
  const hand: TileCode[] = [];
  const freq: FreqTable = {};

  const addTile = (code: TileCode): boolean => {
    if ((freq[code] ?? 0) >= MAX_COPIES) return false;
    hand.push(code);
    freq[code] = (freq[code] ?? 0) + 1;
    return true;
  };

  // Generate 4 random melds
  for (let i = 0; i < 4; i++) {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const isPong = Math.random() < 0.4;

    if (isPong) {
      const val = TILE_VALUES[Math.floor(Math.random() * TILE_VALUES.length)];
      const code = `${suit}${val}` as TileCode;
      if ((freq[code] ?? 0) + 3 <= MAX_COPIES) {
        addTile(code);
        addTile(code);
        addTile(code);
        continue;
      }
    }

    // Chow — pick a start value 1–7
    let placed = false;
    const attempts = [...TILE_VALUES.filter((v) => v <= 7)].sort(() => Math.random() - 0.5);
    for (const start of attempts) {
      const c1 = `${suit}${start}` as TileCode;
      const c2 = `${suit}${start + 1}` as TileCode;
      const c3 = `${suit}${start + 2}` as TileCode;
      if (
        (freq[c1] ?? 0) < MAX_COPIES &&
        (freq[c2] ?? 0) < MAX_COPIES &&
        (freq[c3] ?? 0) < MAX_COPIES
      ) {
        addTile(c1);
        addTile(c2);
        addTile(c3);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Fallback: any pong that fits
      for (const s of SUITS) {
        for (const v of TILE_VALUES) {
          const code = `${s}${v}` as TileCode;
          if ((freq[code] ?? 0) + 3 <= MAX_COPIES) {
            addTile(code);
            addTile(code);
            addTile(code);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
  }

  // Generate 1 pair
  let pairPlaced = false;
  const shuffledTiles = [...ALL_TILES].sort(() => Math.random() - 0.5);
  for (const code of shuffledTiles) {
    if ((freq[code] ?? 0) + 2 <= MAX_COPIES) {
      addTile(code);
      addTile(code);
      pairPlaced = true;
      break;
    }
  }

  if (!pairPlaced || hand.length !== HAND_SIZE) {
    // Extremely unlikely fallback — just return a known winning hand
    return sortHand([
      'B1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'D7', 'D7', 'B8', 'B8', 'B8', 'C1', 'C1',
    ] as TileCode[]);
  }

  return sortHand(hand);
}
