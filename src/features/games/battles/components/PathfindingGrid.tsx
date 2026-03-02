import type { GridMatrix } from '@/features/traversals/graph/types/graph';
import { NodeType } from '@/features/traversals/graph/types/graph';
import type { PathfindingStep } from '../engine/pathfindingEngine';
import { PF_COLS, PF_ALGORITHM_OPTIONS } from '../engine/pathfindingEngine';
import type { PathAlgorithm } from '../engine/pathfindingEngine';

interface PathfindingGridProps {
  grid: GridMatrix;
  step: PathfindingStep | null;
  algorithm: PathAlgorithm;
  color: 'rose' | 'cyan';
  finished: boolean;
  totalVisited: number;
  pathLength: number;
  currentIndex: number;
  totalSteps: number;
}

export default function PathfindingGrid({
  grid,
  step,
  algorithm,
  color,
  finished,
  totalVisited,
  pathLength,
  currentIndex,
  totalSteps,
}: PathfindingGridProps) {
  const name = PF_ALGORITHM_OPTIONS.find((o) => o.value === algorithm)!.label;

  const colors = {
    rose: {
      visited: 'bg-rose-500/40',
      path: 'bg-rose-300',
      current: 'bg-rose-400',
      label: 'text-rose-400',
      badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
      border: finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50',
    },
    cyan: {
      visited: 'bg-cyan-500/40',
      path: 'bg-cyan-300',
      current: 'bg-cyan-400',
      label: 'text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
      border: finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50',
    },
  };
  const c = colors[color];

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-bold ${c.label}`}>{name}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${c.badge}`}>
          {finished ? 'Finished' : 'Running'}
        </span>
      </div>
      <div className={`rounded-xl border border-slate-700/50 bg-slate-950/80 p-1 ${c.border} transition-all overflow-hidden`}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${PF_COLS}, 1fr)`, gap: '1px' }}>
          {grid.map((row, r) =>
            row.map((node, col) => {
              const k = `${r},${col}`;
              let cellClass = 'bg-slate-800/40';

              if (node.type === NodeType.WALL) {
                cellClass = 'bg-slate-600';
              } else if (node.type === NodeType.START) {
                cellClass = 'bg-emerald-500';
              } else if (node.type === NodeType.END) {
                cellClass = 'bg-amber-500';
              } else if (step) {
                if (step.pathNodes.has(k)) {
                  cellClass = c.path;
                } else if (step.currentNode && step.currentNode.row === r && step.currentNode.col === col) {
                  cellClass = c.current;
                } else if (step.visitedSoFar.has(k)) {
                  cellClass = c.visited;
                }
              }

              return (
                <div
                  key={k}
                  className={`aspect-square rounded-[1px] ${cellClass} transition-colors duration-75`}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-1">
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Visited</div>
          <div className="text-xs font-mono font-bold text-white">{totalVisited}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Path</div>
          <div className="text-xs font-mono font-bold text-white">{pathLength}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Steps</div>
          <div className="text-xs font-mono font-bold text-white">{currentIndex}/{totalSteps}</div>
        </div>
      </div>
    </div>
  );
}
