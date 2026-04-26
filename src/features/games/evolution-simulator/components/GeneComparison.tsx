interface GeneComparisonProps {
  target: string;
  bestGenes: string;
}

export default function GeneComparison({ target, bestGenes }: GeneComparisonProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">DNA Match Board</h3>
        <p className="mt-0.5 text-[10px] text-slate-500">Green cells already match the target phrase</p>
      </div>
      <div className="space-y-3 font-mono text-sm">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Target</div>
          <div className="rounded-xl bg-slate-950/70 ring-1 ring-slate-700/40 px-3 py-2 break-all tracking-wide text-slate-200">{target || '(empty)'}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Best Individual</div>
          <div className="rounded-xl bg-slate-950/70 ring-1 ring-slate-700/40 px-3 py-2 break-all tracking-wide">
            {(bestGenes || '').split('').map((ch, idx) => {
              const ok = target[idx] === ch;
              return (
                <span
                  key={`${ch}-${idx}`}
                  className={`mx-0.5 inline-flex min-w-5 justify-center rounded px-1 py-0.5 ${
                    ok
                      ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/40'
                  }`}
                >
                  {ch}
                </span>
              );
            })}
            {!bestGenes && <span className="text-slate-500">Start the simulator to see candidate DNA.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
