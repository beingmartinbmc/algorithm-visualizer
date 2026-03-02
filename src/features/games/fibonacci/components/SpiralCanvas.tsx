import { useMemo } from 'react';
import type { PlacedSquare } from '../types/fibonacci';
import { getBoundingBox, getArcPath } from '../engine/spiralLayout';

interface SpiralCanvasProps {
  placedSquares: PlacedSquare[];
  lastPlacedId: number | null;
}

const COLORS = [
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
  '#f472b6', '#fb7185', '#f97316', '#facc15',
  '#4ade80', '#34d399', '#2dd4bf', '#22d3ee',
  '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
];

export default function SpiralCanvas({ placedSquares, lastPlacedId }: SpiralCanvasProps) {
  const { viewBox, squares } = useMemo(() => {
    if (placedSquares.length === 0) {
      return { viewBox: '-5 -5 10 10', squares: [] };
    }

    const bb = getBoundingBox(placedSquares);
    const padding = Math.max((bb.maxX - bb.minX) * 0.15, 2);
    const vb = `${bb.minX - padding} ${bb.minY - padding} ${bb.maxX - bb.minX + padding * 2} ${bb.maxY - bb.minY + padding * 2}`;

    return { viewBox: vb, squares: placedSquares };
  }, [placedSquares]);

  if (placedSquares.length === 0) {
    return (
      <div className="flex flex-1 w-full min-h-[200px] h-full items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950/80 text-slate-500">
        Place the first block to begin
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[200px] rounded-xl border border-slate-700/50 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {squares.map((sq, i) => {
          const color = COLORS[i % COLORS.length];
          const isNew = sq.id === lastPlacedId;

          return (
            <g key={sq.id}>
              <rect
                x={sq.x}
                y={sq.y}
                width={sq.size}
                height={sq.size}
                fill={color}
                fillOpacity={0.12}
                stroke={color}
                strokeWidth={Math.max(sq.size * 0.02, 0.15)}
                strokeOpacity={0.6}
                rx={sq.size * 0.02}
                className={isNew ? 'animate-pulse' : ''}
                filter={isNew ? 'url(#glow)' : undefined}
              />
              <text
                x={sq.x + sq.size / 2}
                y={sq.y + sq.size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fillOpacity={0.7}
                fontSize={Math.max(sq.size * 0.35, 0.6)}
                fontWeight={700}
                fontFamily="ui-monospace, monospace"
              >
                {sq.size}
              </text>
            </g>
          );
        })}

        {squares.map((sq, i) => {
          const color = COLORS[i % COLORS.length];
          const arcPath = getArcPath(sq);

          return (
            <path
              key={`arc-${sq.id}`}
              d={arcPath}
              fill="none"
              stroke={color}
              strokeWidth={Math.max(sq.size * 0.03, 0.15)}
              strokeOpacity={0.8}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}
