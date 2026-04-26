import type { Individual } from '../engine';

interface PopulationListProps {
  population: Individual[];
  target: string;
}

export default function PopulationList({ population, target }: PopulationListProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Candidate Profiles</h3>
          <p className="mt-0.5 text-[10px] text-slate-500">The strongest survivors in this generation</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
          Top {population.length || 0}
        </span>
      </div>
      <div className="space-y-1.5 max-h-72 overflow-auto pr-1">
        {population.map((ind, idx) => (
          <div
            key={`${ind.genes}-${idx}`}
            className={`rounded-xl px-3 py-2 ring-1 transition-all ${idx === 0 ? 'bg-emerald-500/10 ring-emerald-500/30 shadow-lg shadow-emerald-950/20' : 'bg-slate-800/50 ring-slate-700/40'}`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                Subject #{idx + 1}
              </span>
              <span className="font-mono">{ind.fitness} / {target.length}</span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-200 tracking-wide break-all">
              {ind.genes}
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-950/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                style={{ width: `${(ind.fitness / Math.max(1, target.length)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
