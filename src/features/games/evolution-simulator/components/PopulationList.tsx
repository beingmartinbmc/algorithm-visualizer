import type { Individual } from '../engine';

interface PopulationListProps {
  population: Individual[];
  target: string;
}

export default function PopulationList({ population, target }: PopulationListProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Top 10 Individuals</h3>
      <div className="space-y-1.5 max-h-72 overflow-auto pr-1">
        {population.map((ind, idx) => (
          <div
            key={`${ind.genes}-${idx}`}
            className={`rounded-lg px-2 py-1.5 ring-1 ${idx === 0 ? 'bg-emerald-500/10 ring-emerald-500/30' : 'bg-slate-800/50 ring-slate-700/40'}`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>#{idx + 1}</span>
              <span className="font-mono">{ind.fitness} / {target.length}</span>
            </div>
            <div className="font-mono text-xs text-slate-200 tracking-wide break-all">
              {ind.genes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
