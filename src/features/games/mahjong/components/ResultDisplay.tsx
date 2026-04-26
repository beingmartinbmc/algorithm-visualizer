import type { SolveResult, TileCode, Meld } from '../types/mahjong';
import MahjongTile from './MahjongTile';

interface ResultDisplayProps {
  result: SolveResult | null;
}

function MiniTile({ code }: { code: TileCode }) {
  return <MahjongTile code={code} size="sm" />;
}

function MeldGroup({ meld, index }: { meld: Meld; index: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-950/35 p-2 ring-1 ring-slate-800/70 md:gap-3">
      <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:w-16 md:text-xs">
        {meld.type === 'pong' ? 'Pong' : 'Chow'} {index + 1}
      </span>
      <div className="flex gap-1 md:gap-1.5">
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
      <div className="rounded-2xl border border-emerald-500/30 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_36%),rgba(16,185,129,0.05)] p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-sm md:p-5">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <span className="text-lg md:text-2xl">🀄</span>
          <h3 className="text-sm md:text-base font-bold text-emerald-300">Winning Hand!</h3>
        </div>

        {/* Pair */}
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-950/35 p-2 ring-1 ring-slate-800/70 md:mb-4 md:gap-3">
          <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:w-16 md:text-xs">Pair</span>
          <div className="flex gap-1 md:gap-1.5">
            <MiniTile code={result.pair[0]} />
            <MiniTile code={result.pair[1]} />
          </div>
        </div>

        {/* Melds */}
        <div className="space-y-2 md:space-y-3">
          {result.melds.map((meld, i) => (
            <MeldGroup key={i} meld={meld} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 md:p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg md:text-2xl">❌</span>
        <h3 className="text-sm md:text-base font-bold text-red-300">Not a Winning Hand</h3>
      </div>
      <p className="mt-2 text-xs md:text-sm text-slate-400">
        Hand is not a valid winning combination. A winning hand needs 4 melds (pongs or chows) and 1 pair.
      </p>
    </div>
  );
}
