import type { AlgorithmState } from '../types/battle';
import { ALGORITHM_OPTIONS } from '../types/battle';

interface BattleBarProps {
  state: AlgorithmState;
  color: 'rose' | 'cyan';
  maxVal: number;
}

export default function BattleBar({ state, color, maxVal }: BattleBarProps) {
  const name = ALGORITHM_OPTIONS.find((o) => o.value === state.algorithm)!.label;
  const finished = state.status === 'finished';
  const barCount = state.array.length;

  const colorMap = {
    rose: {
      default: 'bg-rose-500/60',
      comparing: 'bg-amber-400',
      swapping: 'bg-rose-300',
      sorted: 'bg-emerald-500/70',
      border: finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50',
      label: 'text-rose-400',
      badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    },
    cyan: {
      default: 'bg-cyan-500/60',
      comparing: 'bg-amber-400',
      swapping: 'bg-cyan-300',
      sorted: 'bg-emerald-500/70',
      border: finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50',
      label: 'text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
    },
  };

  const c = colorMap[color];
  const comparingSet = new Set(state.comparing || []);
  const swappingSet = new Set(state.swapping || []);
  const sortedSet = new Set(state.sorted);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-bold ${c.label}`}>{name}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${c.badge}`}>
          {finished ? 'Finished' : 'Running'}
        </span>
      </div>
      <div className={`rounded-xl border border-slate-700/50 bg-slate-950/80 p-2 ${c.border} transition-all overflow-hidden`}>
        <div className="flex items-end gap-px h-32 sm:h-44 md:h-52">
          {state.array.map((val, i) => {
            const heightPct = (val / maxVal) * 100;
            let barClass = c.default;
            if (comparingSet.has(i)) barClass = c.comparing;
            else if (swappingSet.has(i)) barClass = c.swapping;
            else if (sortedSet.has(i)) barClass = c.sorted;

            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all duration-75 ${barClass}`}
                style={{
                  height: `${heightPct}%`,
                  minWidth: barCount > 100 ? '1px' : '2px',
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Live metrics */}
      <div className="grid grid-cols-3 gap-1.5 px-1">
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Comparisons</div>
          <div className="text-xs font-mono font-bold text-white">{state.metrics.comparisons}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Swaps</div>
          <div className="text-xs font-mono font-bold text-white">{state.metrics.swaps}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Steps</div>
          <div className="text-xs font-mono font-bold text-white">
            {state.metrics.stepsCompleted}/{state.metrics.totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}
