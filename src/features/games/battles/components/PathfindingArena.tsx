import { Pause, Play, RotateCcw, Volume2, VolumeX, Trophy, Equal } from 'lucide-react';
import type { GridMatrix } from '@/features/traversals/graph/types/graph';
import type { PathfindingAlgoState } from '../hooks/usePathfindingBattle';
import { PF_ALGORITHM_OPTIONS, PF_COMPLEXITY } from '../engine/pathfindingEngine';
import { SPEED_PRESETS } from '../types/battle';
import PathfindingGrid from './PathfindingGrid';

interface PathfindingArenaProps {
  grid: GridMatrix;
  stateA: PathfindingAlgoState;
  stateB: PathfindingAlgoState;
  status: 'running' | 'paused' | 'finished';
  winner: 'A' | 'B' | 'tie' | null;
  prediction: 'A' | 'B' | null;
  predictionCorrect: boolean | null;
  speed: number;
  soundEnabled: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetSpeed: (s: number) => void;
  onToggleSound: (v: boolean) => void;
}

export default function PathfindingArena({
  grid,
  stateA,
  stateB,
  status,
  winner,
  prediction,
  predictionCorrect,
  speed,
  soundEnabled,
  onPause,
  onResume,
  onReset,
  onSetSpeed,
  onToggleSound,
}: PathfindingArenaProps) {
  const isRunning = status === 'running';
  const nameA = PF_ALGORITHM_OPTIONS.find((o) => o.value === stateA.algorithm)!.label;
  const nameB = PF_ALGORITHM_OPTIONS.find((o) => o.value === stateB.algorithm)!.label;
  const stepA = stateA.currentIndex < stateA.steps.length ? stateA.steps[stateA.currentIndex] : null;
  const stepB = stateB.currentIndex < stateB.steps.length ? stateB.steps[stateB.currentIndex] : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {status !== 'finished' && (
              <button onClick={isRunning ? onPause : onResume}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/60">
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            )}
            <button onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/60">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={() => onToggleSound(!soundEnabled)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ring-1 ${soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30' : 'bg-slate-800/60 text-slate-500 ring-slate-700/40'}`}>
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          {status !== 'finished' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Speed:</span>
              {SPEED_PRESETS.map((s) => (
                <button key={s.value} onClick={() => onSetSpeed(s.value)}
                  className={`rounded px-2 py-1 text-[10px] font-medium ${speed === s.value ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dual grids */}
        <div className="flex flex-col sm:flex-row gap-4">
          <PathfindingGrid
            grid={grid} step={stepA} algorithm={stateA.algorithm} color="rose"
            finished={stateA.finished} totalVisited={stateA.totalVisited}
            pathLength={stateA.pathLength} currentIndex={stateA.currentIndex} totalSteps={stateA.steps.length}
          />
          <PathfindingGrid
            grid={grid} step={stepB} algorithm={stateB.algorithm} color="cyan"
            finished={stateB.finished} totalVisited={stateB.totalVisited}
            pathLength={stateB.pathLength} currentIndex={stateB.currentIndex} totalSteps={stateB.steps.length}
          />
        </div>

        {/* Result */}
        {status === 'finished' && winner && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
            <div className="text-center">
              {winner === 'tie' ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2 ring-1 ring-amber-500/20">
                  <Equal size={18} className="text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">It's a Tie!</span>
                </div>
              ) : (
                <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 ring-1 ${winner === 'A' ? 'bg-rose-500/10 ring-rose-500/20' : 'bg-cyan-500/10 ring-cyan-500/20'}`}>
                  <Trophy size={18} className={winner === 'A' ? 'text-rose-400' : 'text-cyan-400'} />
                  <span className={`text-sm font-bold ${winner === 'A' ? 'text-rose-300' : 'text-cyan-300'}`}>
                    {winner === 'A' ? nameA : nameB} Wins!
                  </span>
                </div>
              )}
            </div>

            {prediction && predictionCorrect !== null && (
              <div className={`rounded-lg px-4 py-2.5 text-center text-xs font-medium ${predictionCorrect ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20'}`}>
                {predictionCorrect ? '🎯 Correct prediction!' : '❌ Wrong prediction. Keep learning!'}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="py-2 text-left text-slate-500">Metric</th>
                    <th className="py-2 text-center text-rose-400 font-semibold">{nameA}</th>
                    <th className="py-2 text-center text-cyan-400 font-semibold">{nameB}</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[
                    { label: 'Nodes Visited', a: stateA.totalVisited, b: stateB.totalVisited },
                    { label: 'Path Length', a: stateA.pathLength, b: stateB.pathLength },
                    { label: 'Total Steps', a: stateA.steps.length, b: stateB.steps.length },
                  ].map(({ label, a, b }) => (
                    <tr key={label} className="border-b border-slate-800/50">
                      <td className="py-2 text-slate-400">{label}</td>
                      <td className={`py-2 text-center font-semibold ${a <= b ? 'text-emerald-300' : 'text-white'}`}>{a}{a < b ? ' ✓' : ''}</td>
                      <td className={`py-2 text-center font-semibold ${b <= a ? 'text-emerald-300' : 'text-white'}`}>{b}{b < a ? ' ✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: nameA, comp: PF_COMPLEXITY[stateA.algorithm], color: 'rose' as const },
                { name: nameB, comp: PF_COMPLEXITY[stateB.algorithm], color: 'cyan' as const },
              ].map(({ name, comp, color }) => (
                <div key={name} className="rounded-lg bg-slate-800/40 p-3">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${color === 'rose' ? 'text-rose-400' : 'text-cyan-400'} mb-2`}>{name}</h4>
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="text-slate-300">{comp.time}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Space</span><span className="text-slate-300">{comp.space}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Optimal</span><span className={comp.optimal ? 'text-emerald-300' : 'text-rose-300'}>{comp.optimal ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onReset}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/60 px-6 py-3 text-sm font-medium text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/60 active:scale-[0.98]">
              <RotateCcw size={14} /> New Battle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
