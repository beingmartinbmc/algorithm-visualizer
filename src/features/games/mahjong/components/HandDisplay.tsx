import type { TileCode } from '../types/mahjong';
import { HAND_SIZE } from '../types/mahjong';
import MahjongTile from './MahjongTile';

interface HandDisplayProps {
  hand: TileCode[];
  onRemoveTile: (index: number) => void;
}

export default function HandDisplay({ hand, onRemoveTile }: HandDisplayProps) {
  const empty = HAND_SIZE - hand.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,59,0.36))] p-4 shadow-2xl shadow-black/30 md:p-5">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div>
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-emerald-200">Your Hand</h3>
          <p className="mt-0.5 text-[10px] text-emerald-100/50">Click a tile to discard it from the rack</p>
        </div>
        <span className={`text-xs md:text-sm font-mono font-bold ${hand.length === HAND_SIZE ? 'text-emerald-400' : 'text-slate-500'}`}>
          {hand.length} / {HAND_SIZE}
        </span>
      </div>
      <div className="relative flex min-h-[5.5rem] flex-wrap items-end gap-1.5 rounded-xl border border-emerald-950/40 bg-emerald-950/20 p-3 shadow-inner md:gap-2">
        {hand.map((code, i) => (
          <MahjongTile
            key={`${code}-${i}`}
            code={code}
            index={i}
            size="lg"
            interactive
            removable
            onClick={() => onRemoveTile(i)}
          />
        ))}
        {empty > 0 && Array.from({ length: empty }).map((_, i) => (
          <MahjongTile key={`empty-${i}`} size="lg" placeholder />
        ))}
      </div>
    </div>
  );
}
