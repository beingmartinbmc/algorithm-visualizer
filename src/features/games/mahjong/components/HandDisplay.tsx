import type { TileCode, Suit } from '../types/mahjong';
import { SUIT_COLORS, HAND_SIZE } from '../types/mahjong';

interface HandDisplayProps {
  hand: TileCode[];
  onRemoveTile: (index: number) => void;
}

function TileCard({ code, index, onRemove }: { code: TileCode; index: number; onRemove: () => void }) {
  const suit = code[0] as Suit;
  const value = code[1];
  const color = SUIT_COLORS[suit];
  const suitSymbol = suit === 'B' ? '竹' : suit === 'C' ? '万' : '●';

  return (
    <button
      onClick={onRemove}
      title={`Remove ${code}`}
      className="group relative flex flex-col items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/80 w-11 h-14 sm:w-12 sm:h-16 md:w-14 md:h-[4.25rem] lg:w-16 lg:h-[4.75rem] transition-all duration-150 hover:border-red-500/50 hover:bg-red-950/20 hover:scale-105 active:scale-95 cursor-pointer"
    >
      <span style={{ color }} className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold leading-none">
        {value}
      </span>
      <span className="text-[9px] md:text-[10px] text-slate-500 leading-none mt-0.5 md:mt-1">{suitSymbol}</span>
      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/60 text-white text-xs md:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        ✕
      </span>
      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-slate-600 font-mono">
        {index + 1}
      </span>
    </button>
  );
}

export default function HandDisplay({ hand, onRemoveTile }: HandDisplayProps) {
  const empty = HAND_SIZE - hand.length;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 md:p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400">Your Hand</h3>
        <span className={`text-xs md:text-sm font-mono font-bold ${hand.length === HAND_SIZE ? 'text-emerald-400' : 'text-slate-500'}`}>
          {hand.length} / {HAND_SIZE}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 md:gap-2 min-h-[4rem] md:min-h-[5rem]">
        {hand.map((code, i) => (
          <TileCard key={`${code}-${i}`} code={code} index={i} onRemove={() => onRemoveTile(i)} />
        ))}
        {empty > 0 && Array.from({ length: empty }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center rounded-lg border border-dashed border-slate-800 w-11 h-14 sm:w-12 sm:h-16 md:w-14 md:h-[4.25rem] lg:w-16 lg:h-[4.75rem] text-slate-800 text-xs md:text-sm"
          >
            ?
          </div>
        ))}
      </div>
      {hand.length > 0 && (
        <p className="mt-2 md:mt-3 text-[10px] md:text-xs text-slate-600">Click a tile to remove it</p>
      )}
    </div>
  );
}
