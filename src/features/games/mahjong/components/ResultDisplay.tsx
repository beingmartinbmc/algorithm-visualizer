import type { SolveResult, TileCode, Suit, Meld } from '../types/mahjong';
import { SUIT_COLORS } from '../types/mahjong';

interface ResultDisplayProps {
  result: SolveResult | null;
}

function MiniTile({ code }: { code: TileCode }) {
  const suit = code[0] as Suit;
  const value = code[1];
  const color = SUIT_COLORS[suit];
  const suitSymbol = suit === 'B' ? '竹' : suit === 'C' ? '万' : '●';

  return (
    <span
      className="inline-flex flex-col items-center justify-center rounded-md border border-slate-700/60 bg-slate-900/80 w-9 h-11 sm:w-10 sm:h-12"
    >
      <span style={{ color }} className="text-sm sm:text-base font-extrabold leading-none">{value}</span>
      <span className="text-[7px] text-slate-500 leading-none mt-0.5">{suitSymbol}</span>
    </span>
  );
}

function MeldGroup({ meld, index }: { meld: Meld; index: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-medium text-slate-600 w-12 shrink-0">
        {meld.type === 'pong' ? 'Pong' : 'Chow'} {index + 1}
      </span>
      <div className="flex gap-0.5">
        {meld.tiles.map((t, i) => (
          <MiniTile key={`${t}-${i}`} code={t} />
        ))}
      </div>
    </div>
  );
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  if (!result) return null;

  if (result.isWin) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🀄</span>
          <h3 className="text-sm font-bold text-emerald-300">Winning Hand!</h3>
        </div>

        {/* Pair */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px] font-medium text-slate-600 w-12 shrink-0">Pair</span>
          <div className="flex gap-0.5">
            <MiniTile code={result.pair[0]} />
            <MiniTile code={result.pair[1]} />
          </div>
        </div>

        {/* Melds */}
        <div className="space-y-2">
          {result.melds.map((meld, i) => (
            <MeldGroup key={i} meld={meld} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">❌</span>
        <h3 className="text-sm font-bold text-red-300">Not a Winning Hand</h3>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Hand is not a valid winning combination. A winning hand needs 4 melds (pongs or chows) and 1 pair.
      </p>
    </div>
  );
}
