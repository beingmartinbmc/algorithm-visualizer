import { memo } from 'react';

interface BarChartProps {
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sortedIndices: number[];
}

function getBarColor(
  index: number,
  comparing: [number, number] | null,
  swapping: [number, number] | null,
  sortedIndices: number[]
): string {
  if (swapping && (index === swapping[0] || index === swapping[1])) {
    return 'bg-rose-500 shadow-lg shadow-rose-500/30';
  }
  if (comparing && (index === comparing[0] || index === comparing[1])) {
    return 'bg-amber-400 shadow-lg shadow-amber-400/20';
  }
  if (sortedIndices.includes(index)) {
    return 'bg-emerald-500';
  }
  return 'bg-indigo-400/80';
}

function BarChartComponent({ array, comparing, swapping, sortedIndices }: BarChartProps) {
  const maxVal = Math.max(...array, 1);
  const barWidth = Math.max(2, Math.min(20, Math.floor(900 / array.length) - 1));

  return (
    <div className="flex h-[500px] items-end justify-center gap-[1px] rounded-xl border border-slate-700/50 bg-slate-950/80 p-6 backdrop-blur-sm shadow-2xl">
      {array.map((value, index) => {
        const heightPercent = (value / maxVal) * 100;
        const colorClass = getBarColor(index, comparing, swapping, sortedIndices);

        return (
          <div
            key={index}
            className={`transition-all duration-75 rounded-t-sm ${colorClass}`}
            style={{
              height: `${heightPercent}%`,
              width: `${barWidth}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export default memo(BarChartComponent);
