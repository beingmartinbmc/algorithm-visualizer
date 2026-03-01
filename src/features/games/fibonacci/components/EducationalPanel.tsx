import { useMemo } from 'react';
import { getConvergenceData } from '../engine/fibonacci';

interface EducationalPanelProps {
  sequence: number[];
}

const PHI = 1.6180339887;

export default function EducationalPanel({ sequence }: EducationalPanelProps) {
  const convergenceData = useMemo(() => getConvergenceData(sequence), [sequence]);
  const currentRatio = convergenceData.length > 0
    ? convergenceData[convergenceData.length - 1].ratio
    : 0;

  const maxBarHeight = 60;

  return (
    <div className="flex gap-4 w-full">
      {/* Golden Ratio */}
      <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Golden Ratio Convergence
        </h3>
        <div className="flex items-end gap-1.5 h-16 mb-2">
          {convergenceData.map((d, i) => {
            const deviation = Math.abs(d.ratio - PHI);
            const normalized = Math.max(0, 1 - deviation * 4);
            const height = Math.max(4, normalized * maxBarHeight);
            const isLast = i === convergenceData.length - 1;

            return (
              <div
                key={d.index}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${height}px`,
                  backgroundColor: isLast ? '#818cf8' : `rgba(129, 140, 248, ${0.3 + normalized * 0.5})`,
                }}
                title={`F(${d.index})/F(${d.index - 1}) = ${d.ratio.toFixed(6)}`}
              />
            );
          })}
          {convergenceData.length === 0 && (
            <p className="text-[10px] text-slate-600">Place more blocks to see convergence</p>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">F(n)/F(n-1)</span>
          <span className="font-mono text-indigo-300">
            {currentRatio > 0 ? currentRatio.toFixed(6) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-0.5">
          <span className="text-slate-500">Golden Ratio φ</span>
          <span className="font-mono text-amber-300">{PHI.toFixed(6)}</span>
        </div>
        {currentRatio > 0 && (
          <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (1 - Math.abs(currentRatio - PHI)) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Formula */}
      <div className="w-64 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Formula
        </h3>
        <div className="rounded-lg bg-slate-800/40 p-3 font-mono text-xs text-slate-300 space-y-1">
          <p className="text-indigo-300">F(n) = F(n-1) + F(n-2)</p>
          <p className="text-slate-500">F(0) = 1, F(1) = 1</p>
        </div>
        <div className="mt-3 space-y-1 text-[10px] text-slate-500">
          <p>The Fibonacci sequence appears throughout nature:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {['🌻 Sunflowers', '🐚 Shells', '🌀 Galaxies', '🌿 Leaf patterns'].map((item) => (
              <span
                key={item}
                className="inline-flex rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
