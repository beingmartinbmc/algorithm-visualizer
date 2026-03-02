import { Pause, Play, RotateCcw, Volume2, VolumeX, Trophy, Equal } from 'lucide-react';
import type { RecursionAlgoState } from '../hooks/useRecursionBattle';
import { REC_ALGORITHM_OPTIONS, REC_COMPLEXITY } from '../engine/recursionEngine';
import { SPEED_PRESETS } from '../types/battle';

interface RecursionArenaProps {
  stateA: RecursionAlgoState;
  stateB: RecursionAlgoState;
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

function RecursionPanel({ state, color }: { state: RecursionAlgoState; color: 'rose' | 'cyan' }) {
  const name = REC_ALGORITHM_OPTIONS.find((o) => o.value === state.algorithm)!.label;
  const step = state.currentIndex < state.steps.length ? state.steps[state.currentIndex] : null;
  const maxSteps = state.steps.length;
  const progress = maxSteps > 0 ? (state.currentIndex / maxSteps) * 100 : 0;

  const c = color === 'rose'
    ? { label: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/30', bar: 'bg-rose-500', border: state.finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50' }
    : { label: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30', bar: 'bg-cyan-500', border: state.finished ? 'ring-2 ring-emerald-500/50' : 'ring-1 ring-slate-700/50' };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-bold ${c.label}`}>{name}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${c.badge}`}>
          {state.finished ? 'Finished' : 'Running'}
        </span>
      </div>

      {/* Call progress bar */}
      <div className={`rounded-xl border border-slate-700/50 bg-slate-950/80 p-3 ${c.border} transition-all`}>
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-slate-500">Function Calls</span>
            <span className="text-[10px] font-mono text-slate-400">{step ? step.callCount : 0} / {state.totalCalls}</span>
          </div>
          <div className="h-4 rounded-full bg-slate-800/60 overflow-hidden">
            <div className={`h-full rounded-full ${c.bar} transition-all duration-75`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stack depth visualization */}
        <div className="mb-2">
          <span className="text-[10px] text-slate-500 block mb-1">Stack Depth</span>
          <div className="flex items-end gap-px h-16">
            {Array.from({ length: Math.max(step?.maxDepth || 1, 1) }, (_, i) => {
              const isActive = step ? i < step.currentDepth : false;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all duration-75 ${isActive ? c.bar + '/60' : 'bg-slate-800/30'}`}
                  style={{ height: `${((i + 1) / Math.max(step?.maxDepth || 1, 1)) * 100}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Current state */}
        {step && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>fib({step.currentN})</span>
            {step.result !== null && <span className="text-emerald-400">= {step.result}</span>}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-1.5 px-1">
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Calls</div>
          <div className="text-xs font-mono font-bold text-white">{state.totalCalls}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Cache Hits</div>
          <div className="text-xs font-mono font-bold text-white">{state.totalCacheHits}</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-500">Max Depth</div>
          <div className="text-xs font-mono font-bold text-white">{state.maxDepth}</div>
        </div>
      </div>
    </div>
  );
}

export default function RecursionArena({
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
}: RecursionArenaProps) {
  const isRunning = status === 'running';
  const nameA = REC_ALGORITHM_OPTIONS.find((o) => o.value === stateA.algorithm)!.label;
  const nameB = REC_ALGORITHM_OPTIONS.find((o) => o.value === stateB.algorithm)!.label;

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

        {/* Dual panels */}
        <div className="flex flex-col sm:flex-row gap-4">
          <RecursionPanel state={stateA} color="rose" />
          <RecursionPanel state={stateB} color="cyan" />
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
                    { label: 'Total Calls', a: stateA.totalCalls, b: stateB.totalCalls },
                    { label: 'Cache Hits', a: stateA.totalCacheHits, b: stateB.totalCacheHits },
                    { label: 'Max Stack Depth', a: stateA.maxDepth, b: stateB.maxDepth },
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
                { name: nameA, comp: REC_COMPLEXITY[stateA.algorithm], color: 'rose' as const },
                { name: nameB, comp: REC_COMPLEXITY[stateB.algorithm], color: 'cyan' as const },
              ].map(({ name, comp, color }) => (
                <div key={name} className="rounded-lg bg-slate-800/40 p-3">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider ${color === 'rose' ? 'text-rose-400' : 'text-cyan-400'} mb-2`}>{name}</h4>
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="text-slate-300">{comp.time}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Space</span><span className="text-slate-300">{comp.space}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-indigo-500/5 px-4 py-3 ring-1 ring-indigo-500/15">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Why?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {stateA.totalCalls > stateB.totalCalls
                  ? `${nameA} made ${stateA.totalCalls} function calls compared to ${nameB}'s ${stateB.totalCalls}. `
                  : stateB.totalCalls > stateA.totalCalls
                  ? `${nameB} made ${stateB.totalCalls} function calls compared to ${nameA}'s ${stateA.totalCalls}. `
                  : `Both made ${stateA.totalCalls} calls. `}
                Naive recursion recalculates the same subproblems exponentially (O(2ⁿ)), while memoization caches results reducing to O(n). The iterative approach avoids recursion overhead entirely with O(1) space.
              </p>
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
