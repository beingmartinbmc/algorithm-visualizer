interface FitnessChartProps {
  best: number[];
  avg: number[];
  targetLength: number;
}

function toPoints(values: number[], width: number, height: number, maxY: number): string {
  if (values.length === 0) return '';
  if (values.length === 1) return `0,${height}`;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (Math.max(0, v) / Math.max(1, maxY)) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function FitnessChart({ best, avg, targetLength }: FitnessChartProps) {
  const width = 640;
  const height = 220;
  const maxY = Math.max(targetLength, ...best, ...avg, 1);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Fitness Monitor</h3>
        <p className="mt-0.5 text-[10px] text-slate-500">Lab readout for best and average population health</p>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px] h-56 rounded-xl bg-slate-950/80 ring-1 ring-slate-700/50">
          <defs>
            <linearGradient id="fitnessGlow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgb(244 63 94)" />
              <stop offset="100%" stopColor="rgb(52 211 153)" />
            </linearGradient>
          </defs>
          <line x1="0" y1={height} x2={width} y2={height} stroke="rgb(71 85 105 / 0.7)" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2={height} stroke="rgb(71 85 105 / 0.7)" strokeWidth="1" />
          {targetLength > 0 && (
            <line
              x1="0"
              y1={height - (targetLength / maxY) * height}
              x2={width}
              y2={height - (targetLength / maxY) * height}
              stroke="rgb(74 222 128 / 0.35)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )}
          <polyline fill="none" stroke="url(#fitnessGlow)" strokeWidth="3" points={toPoints(best, width, height, maxY)} />
          <polyline fill="none" stroke="rgb(56 189 248)" strokeWidth="2" points={toPoints(avg, width, height, maxY)} />
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Best Fitness</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> Average Fitness</span>
      </div>
    </div>
  );
}
