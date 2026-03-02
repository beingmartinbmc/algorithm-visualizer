import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { AlgorithmState } from '../types/battle';
import { ALGORITHM_OPTIONS, SPEED_PRESETS } from '../types/battle';
import BattleBar from './BattleBar';
import PerformanceGraph from './PerformanceGraph';
import BattleResult from './BattleResult';
import type { InputType } from '../types/battle';

interface BattleArenaProps {
  stateA: AlgorithmState;
  stateB: AlgorithmState;
  status: 'running' | 'paused' | 'finished';
  winner: 'A' | 'B' | 'tie' | null;
  prediction: 'A' | 'B' | null;
  predictionCorrect: boolean | null;
  inputType: InputType;
  speed: number;
  soundEnabled: boolean;
  metricsHistory: { stepA: number; stepB: number; opsA: number; opsB: number }[];
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetSpeed: (s: number) => void;
  onToggleSound: (v: boolean) => void;
}

export default function BattleArena({
  stateA,
  stateB,
  status,
  winner,
  prediction,
  predictionCorrect,
  inputType,
  speed,
  soundEnabled,
  metricsHistory,
  onPause,
  onResume,
  onReset,
  onSetSpeed,
  onToggleSound,
}: BattleArenaProps) {
  const nameA = ALGORITHM_OPTIONS.find((o) => o.value === stateA.algorithm)!.label;
  const nameB = ALGORITHM_OPTIONS.find((o) => o.value === stateB.algorithm)!.label;
  const maxVal = Math.max(...stateA.array, ...stateB.array, 1);
  const isRunning = status === 'running';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Controls bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {status !== 'finished' && (
              <button
                onClick={isRunning ? onPause : onResume}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 ring-1 ring-slate-700/50 transition-all hover:bg-slate-700/60"
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 ring-1 ring-slate-700/50 transition-all hover:bg-slate-700/60"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={() => onToggleSound(!soundEnabled)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ring-1 ${
                soundEnabled
                  ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
                  : 'bg-slate-800/60 text-slate-500 ring-slate-700/40'
              }`}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          {status !== 'finished' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Speed:</span>
              {SPEED_PRESETS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSetSpeed(s.value)}
                  className={`rounded px-2 py-1 text-[10px] font-medium transition-all ${
                    speed === s.value
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {/* Progress */}
          <div className="text-xs text-slate-500 font-mono">
            {stateA.metrics.timeElapsed.toFixed(1)}s
          </div>
        </div>

        {/* Dual visualization */}
        <div className="flex flex-col sm:flex-row gap-4">
          <BattleBar state={stateA} color="rose" maxVal={maxVal} />
          <BattleBar state={stateB} color="cyan" maxVal={maxVal} />
        </div>

        {/* Performance graph */}
        <PerformanceGraph history={metricsHistory} nameA={nameA} nameB={nameB} />

        {/* Result */}
        {status === 'finished' && winner && (
          <BattleResult
            stateA={stateA}
            stateB={stateB}
            winner={winner}
            prediction={prediction}
            predictionCorrect={predictionCorrect}
            inputType={inputType}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}
