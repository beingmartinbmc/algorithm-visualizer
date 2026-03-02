import type { TileCode, Suit } from '../types/mahjong';
import { SUITS, SUIT_NAMES, SUIT_COLORS, TILE_VALUES } from '../types/mahjong';

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
  const color = SUIT_COLORS[suit];
  const isFull = count >= 4;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isFull}
      className={`
        relative flex flex-col items-center justify-center rounded-lg border
        w-10 h-12 sm:w-11 sm:h-14 text-xs font-bold transition-all duration-150
        ${disabled || isFull
          ? 'border-slate-800 bg-slate-900/30 text-slate-700 cursor-not-allowed opacity-40'
          : 'border-slate-700/60 bg-slate-900/60 hover:scale-105 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer active:scale-95'
        }
      `}
    >
      <span style={{ color: disabled || isFull ? undefined : color }} className="text-sm sm:text-base font-extrabold leading-none">
        {value}
      </span>
      <span className="text-[8px] sm:text-[9px] text-slate-500 leading-none mt-0.5">
        {suit === 'B' ? '竹' : suit === 'C' ? '万' : '●'}
      </span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-slate-300 ring-1 ring-slate-600">
          {count}
        </span>
      )}
    </button>
  );
}

export default function TileSelector({ hand, handIsFull, onAddTile }: TileSelectorProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Tile Palette</h3>
      <div className="space-y-3">
        {SUITS.map((suit) => (
          <div key={suit}>
            <p className="text-[10px] font-medium mb-1.5" style={{ color: SUIT_COLORS[suit] }}>
              {SUIT_NAMES[suit]}
            </p>
            <div className="flex flex-wrap gap-1">
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
