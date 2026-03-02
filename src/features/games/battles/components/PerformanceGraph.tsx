import { useMemo } from 'react';

interface PerformanceGraphProps {
  history: { stepA: number; stepB: number; opsA: number; opsB: number }[];
  nameA: string;
  nameB: string;
}

export default function PerformanceGraph({ history, nameA, nameB }: PerformanceGraphProps) {
  const { pathA, pathB, maxOps, maxTime } = useMemo(() => {
    if (history.length < 2) return { pathA: '', pathB: '', maxOps: 1, maxTime: 1 };

    const mOps = Math.max(
      ...history.map((h) => Math.max(h.opsA, h.opsB)),
      1
    );
    const mTime = history.length - 1;

    const W = 400;
    const H = 120;

    const toPath = (key: 'opsA' | 'opsB') => {
      return history
        .map((h, i) => {
          const x = (i / mTime) * W;
          const y = H - (h[key] / mOps) * H;
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    };

    return { pathA: toPath('opsA'), pathB: toPath('opsB'), maxOps: mOps, maxTime: mTime };
  }, [history]);

  if (history.length < 2) return null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Live Performance
      </h3>
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-full bg-rose-400" />
          <span className="text-[10px] text-slate-400">{nameA}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-full bg-cyan-400" />
          <span className="text-[10px] text-slate-400">{nameB}</span>
        </div>
        <span className="ml-auto text-[10px] text-slate-500">Max ops: {maxOps}</span>
      </div>
      <svg viewBox="0 0 400 120" className="w-full h-20 sm:h-28" preserveAspectRatio="none">
        <path d={pathA} fill="none" stroke="#fb7185" strokeWidth={2} strokeLinecap="round" />
        <path d={pathB} fill="none" stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" />
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-slate-600">0</span>
        <span className="text-[9px] text-slate-600">Steps → {maxTime}</span>
      </div>
    </div>
  );
}
