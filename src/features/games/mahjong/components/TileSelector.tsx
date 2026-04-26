import type { TileCode, Suit } from '../types/mahjong';
import { SUITS, SUIT_NAMES, SUIT_COLORS, TILE_VALUES } from '../types/mahjong';
import MahjongTile from './MahjongTile';

interface TileSelectorProps {
  hand: TileCode[];
  handIsFull: boolean;
  onAddTile: (tile: TileCode) => void;
}

function tileCount(hand: TileCode[], code: TileCode): number {
  return hand.filter((t) => t === code).length;
}

function TileButton({ suit, value, count, disabled, onClick }: {
  suit: Suit;
  value: number;
  count: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const isFull = count >= 4;
  const code = `${suit}${value}` as TileCode;

  return (
    <MahjongTile
      code={code}
      count={count}
      size="md"
      disabled={disabled || isFull}
      interactive
      onClick={onClick}
    />
  );
}

export default function TileSelector({ hand, handIsFull, onAddTile }: TileSelectorProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm md:p-5">
      <div className="mb-3 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-300">Tile Wall</h3>
        <p className="mt-0.5 text-[10px] text-slate-500">Choose up to four copies of each realistic Mahjong tile</p>
      </div>
      <div className="space-y-4 md:space-y-5">
        {SUITS.map((suit) => (
          <div key={suit} className="rounded-xl border border-slate-800/70 bg-slate-950/35 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SUIT_COLORS[suit] }} />
              <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider" style={{ color: SUIT_COLORS[suit] }}>
                {SUIT_NAMES[suit]}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-1.5 md:gap-2">
              {TILE_VALUES.map((v) => {
                const code = `${suit}${v}` as TileCode;
                return (
                  <TileButton
                    key={code}
                    suit={suit}
                    value={v}
                    count={tileCount(hand, code)}
                    disabled={handIsFull}
                    onClick={() => onAddTile(code)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
