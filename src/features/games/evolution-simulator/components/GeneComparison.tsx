interface GeneComparisonProps {
  target: string;
  bestGenes: string;
}

export default function GeneComparison({ target, bestGenes }: GeneComparisonProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Gene Comparison</h3>
      <div className="space-y-2 font-mono text-sm">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Target</div>
          <div className="rounded-lg bg-slate-950/70 ring-1 ring-slate-700/40 px-2 py-1.5 break-all tracking-wide text-slate-200">{target || '(empty)'}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Best Individual</div>
          <div className="rounded-lg bg-slate-950/70 ring-1 ring-slate-700/40 px-2 py-1.5 break-all tracking-wide">
            {(bestGenes || '').split('').map((ch, idx) => {
              const ok = target[idx] === ch;
              return (
                <span key={`${ch}-${idx}`} className={ok ? 'text-emerald-300' : 'text-slate-200'}>
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
