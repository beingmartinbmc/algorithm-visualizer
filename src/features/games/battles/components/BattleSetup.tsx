import {
  Swords,
  Play,
  Volume2,
  VolumeX,
  Shuffle,
} from 'lucide-react';
import type { SortingAlgorithmType } from '@/features/sorting/types/sorting';
import type { GameMode, InputType } from '../types/battle';
import { ALGORITHM_OPTIONS, SPEED_PRESETS } from '../types/battle';

interface BattleSetupProps {
  algorithmA: SortingAlgorithmType;
  algorithmB: SortingAlgorithmType;
  inputSize: number;
  inputType: InputType;
  gameMode: GameMode;
  speed: number;
  soundEnabled: boolean;
  prediction: 'A' | 'B' | null;
  onSetAlgorithmA: (a: SortingAlgorithmType) => void;
  onSetAlgorithmB: (a: SortingAlgorithmType) => void;
  onSetInputSize: (s: number) => void;
  onSetInputType: (t: InputType) => void;
  onSetGameMode: (m: GameMode) => void;
  onSetSpeed: (s: number) => void;
  onToggleSound: (v: boolean) => void;
  onSetPrediction: (p: 'A' | 'B' | null) => void;
  onStart: () => void;
}

const inputTypes: { value: InputType; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'nearly-sorted', label: 'Nearly Sorted' },
  { value: 'reversed', label: 'Reversed' },
];

const gameModes: { value: GameMode; label: string; desc: string }[] = [
  { value: 'realtime', label: 'Real-Time', desc: 'Watch both algorithms animate step-by-step' },
  { value: 'turbo', label: 'Turbo', desc: 'Instant execution, metrics only' },
  { value: 'prediction', label: 'Prediction', desc: 'Predict the winner before starting' },
];

export default function BattleSetup({
  algorithmA,
  algorithmB,
  inputSize,
  inputType,
  gameMode,
  speed,
  soundEnabled,
  prediction,
  onSetAlgorithmA,
  onSetAlgorithmB,
  onSetInputSize,
  onSetInputType,
  onSetGameMode,
  onSetSpeed,
  onToggleSound,
  onSetPrediction,
  onStart,
}: BattleSetupProps) {
  const nameA = ALGORITHM_OPTIONS.find((o) => o.value === algorithmA)!.label;
  const nameB = ALGORITHM_OPTIONS.find((o) => o.value === algorithmB)!.label;

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center justify-center px-6 pt-8 pb-4 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 ring-1 ring-rose-500/20">
          <Swords size={14} className="text-rose-400" />
          <span className="text-xs font-medium text-rose-300">Algorithm Battles</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">{nameA}</span>
          {' '}vs{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{nameB}</span>
        </h2>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Algorithm Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-3">
                Algorithm A
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {ALGORITHM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSetAlgorithmA(opt.value)}
                    className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${
                      algorithmA === opt.value
                        ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                Algorithm B
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {ALGORITHM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSetAlgorithmB(opt.value)}
                    className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${
                      algorithmB === opt.value
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Config */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Input Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Array Size</span>
                  <span className="text-sm font-mono font-bold text-indigo-300">{inputSize}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={inputSize}
                  onChange={(e) => onSetInputSize(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div className="flex gap-1.5">
                {inputTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onSetInputType(t.value)}
                    className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${
                      inputType === t.value
                        ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Mode */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Game Mode
            </h3>
            <div className="flex gap-1.5">
              {gameModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => onSetGameMode(m.value)}
                  className={`flex-1 flex flex-col items-center rounded-lg px-2 py-2.5 text-[11px] font-medium transition-all ${
                    gameMode === m.value
                      ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prediction (only in prediction mode) */}
          {gameMode === 'prediction' && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                Your Prediction
              </h3>
              <p className="text-[10px] text-amber-300/60 mb-3">Who will win with fewer operations?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSetPrediction('A')}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    prediction === 'A'
                      ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {nameA}
                </button>
                <button
                  onClick={() => onSetPrediction('B')}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    prediction === 'B'
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {nameB}
                </button>
              </div>
            </div>
          )}

          {/* Speed & Sound */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Speed</h3>
              <div className="flex gap-1.5">
                {SPEED_PRESETS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onSetSpeed(s.value)}
                    className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${
                      speed === s.value
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onToggleSound(!soundEnabled)}
              className={`shrink-0 flex flex-col items-center justify-center rounded-xl px-4 transition-all ${
                soundEnabled
                  ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/60 text-slate-500 ring-1 ring-slate-700/40'
              }`}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="text-[10px] mt-1">{soundEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Start */}
          <button
            onClick={onStart}
            disabled={gameMode === 'prediction' && !prediction}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-cyan-500/20 px-6 py-4 text-base font-bold text-white ring-1 ring-white/10 transition-all hover:from-rose-500/30 hover:to-cyan-500/30 hover:ring-white/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle size={18} className="text-rose-300" />
            <Play size={18} className="text-cyan-300" />
            Start Battle
          </button>
        </div>
      </section>
    </div>
  );
}
