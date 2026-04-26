import type { TileCode, Suit } from '../types/mahjong';
import { SUIT_COLORS } from '../types/mahjong';

type TileSize = 'sm' | 'md' | 'lg';

interface MahjongTileProps {
  code?: TileCode;
  index?: number;
  count?: number;
  size?: TileSize;
  selected?: boolean;
  disabled?: boolean;
  faded?: boolean;
  interactive?: boolean;
  removable?: boolean;
  placeholder?: boolean;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<TileSize, string> = {
  sm: 'w-9 h-12 sm:w-10 sm:h-14',
  md: 'w-11 h-14 sm:w-12 sm:h-16 md:w-14 md:h-[4.35rem]',
  lg: 'w-12 h-16 sm:w-14 sm:h-[4.6rem] md:w-16 md:h-20',
};

export default function MahjongTile({
  code,
  index,
  count,
  size = 'md',
  selected = false,
  disabled = false,
  faded = false,
  interactive = false,
  removable = false,
  placeholder = false,
  onClick,
}: MahjongTileProps) {
  if (placeholder || !code) {
    return (
      <div className={`${SIZE_CLASSES[size]} relative rounded-xl border border-dashed border-emerald-900/30 bg-emerald-950/20 shadow-inner`}>
        <div className="absolute inset-1 rounded-lg border border-emerald-900/20" />
      </div>
    );
  }

  const suit = code[0] as Suit;
  const value = Number(code[1]);
  const color = SUIT_COLORS[suit];
  const content = (
    <>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-stone-50 via-amber-50 to-stone-200" />
      <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/80" />
      <div className="absolute inset-1 rounded-lg border border-amber-950/10 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.8),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.35),transparent)]" />
      <div className="absolute inset-y-1 right-0.5 w-1 rounded-r-lg bg-emerald-900/25" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-1 text-center">
        <TileArt suit={suit} value={value} color={color} size={size} />
      </div>

      <div className="absolute left-1 top-1 text-[8px] font-black leading-none text-slate-900/35">
        {value}
      </div>
      <div className="absolute bottom-1 right-1 rotate-180 text-[8px] font-black leading-none text-slate-900/35">
        {value}
      </div>

      {typeof index === 'number' && index >= 0 && (
        <span className="absolute -bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-950/80 px-1 text-[7px] font-mono text-slate-400 ring-1 ring-slate-700/50">
          {index + 1}
        </span>
      )}

      {typeof count === 'number' && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-500/50">
          {count}
        </span>
      )}

      {removable && (
        <span className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-red-950/70 text-sm font-black text-white opacity-0 transition-opacity group-hover:opacity-100">
          x
        </span>
      )}
    </>
  );

  const className = `
    group relative ${SIZE_CLASSES[size]} shrink-0 overflow-visible rounded-xl border transition-all duration-200
    shadow-[0_10px_18px_rgba(0,0,0,0.35),inset_0_-3px_0_rgba(0,0,0,0.18)]
    ${selected ? 'z-10 -translate-y-2 rotate-[-1deg] border-amber-300 ring-2 ring-amber-300/50' : 'border-amber-950/25'}
    ${disabled ? 'cursor-not-allowed opacity-45 grayscale' : ''}
    ${faded ? 'opacity-35' : ''}
    ${interactive && !disabled ? 'cursor-pointer hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_18px_28px_rgba(0,0,0,0.45)] active:translate-y-0' : ''}
  `;

  if (interactive || onClick) {
    return (
      <button onClick={onClick} disabled={disabled} title={code} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

function TileArt({ suit, value, color, size }: { suit: Suit; value: number; color: string; size: TileSize }) {
  if (suit === 'C') {
    return (
      <div className="flex flex-col items-center">
        <span style={{ color }} className={`${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'} font-black leading-none drop-shadow-sm`}>
          {value}
        </span>
        <span style={{ color }} className={`${size === 'sm' ? 'text-base' : 'text-lg'} font-black leading-none`}>
          萬
        </span>
      </div>
    );
  }

  if (suit === 'B') {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: value }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-1 rounded-full border border-emerald-950/20 bg-gradient-to-b from-emerald-300 to-emerald-700 shadow-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: value }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full border border-blue-950/30 bg-white shadow-sm"
          style={{ boxShadow: `inset 0 0 0 2px ${color}` }}
        />
      ))}
    </div>
  );
}
