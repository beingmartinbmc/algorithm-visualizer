import {
  RotateCcw,
  Shuffle,
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  EyeOff,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { SolverStep } from '../types/mahjong';
import { GAME_DESCRIPTION } from '../types/mahjong';

interface MahjongControlsProps {
  handCount: number;
  handIsFull: boolean;
  result: { isWin: boolean } | null;
  showAnimation: boolean;
  steps: SolverStep[];
  stepIndex: number;
  stepsTotal: number;
  isAnimating: boolean;
  animSpeed: number;
  currentStep: SolverStep | null;
  lastError: string | null;
  onCheckHand: () => void;
  onResetHand: () => void;
  onRandomHand: () => void;
  onWinningHand: () => void;
  onToggleAnimation: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onAutoPlay: () => void;
  onSetAnimSpeed: (speed: number) => void;
  soundEnabled: boolean;
  onToggleSound: (v: boolean) => void;
}

const speeds = [
  { label: 'Slow', value: 800 },
  { label: 'Med', value: 400 },
  { label: 'Fast', value: 150 },
];

export default function MahjongControls({
  handCount: _handCount,
  handIsFull,
  result,
  showAnimation,
  steps,
  stepIndex,
  stepsTotal,
  isAnimating,
  animSpeed,
  currentStep,
  lastError,
  onCheckHand,
  onResetHand,
  onRandomHand,
  onWinningHand,
  onToggleAnimation,
  onStepForward,
  onStepBack,
  onAutoPlay,
  onSetAnimSpeed,
  soundEnabled,
  onToggleSound,
}: MahjongControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full md:w-80 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Game Info */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
        <h3 className="text-sm md:text-base font-bold text-indigo-300 mb-1">{GAME_DESCRIPTION.title}</h3>
        <p className="text-[10px] md:text-xs text-slate-500 italic mb-2">{GAME_DESCRIPTION.subtitle}</p>
        <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{GAME_DESCRIPTION.what}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GAME_DESCRIPTION.skills.map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] md:text-xs font-medium text-violet-400 ring-1 ring-violet-500/20">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
        <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Actions</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-2.5 mb-3">
          <button onClick={onRandomHand} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <Shuffle size={14} /> Random
          </button>
          <button onClick={onWinningHand} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <Sparkles size={14} /> Winning
          </button>
          <button onClick={onResetHand} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={onCheckHand}
            disabled={!handIsFull}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs md:text-sm font-medium transition-all ${
              handIsFull
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 hover:bg-indigo-500/30'
                : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Search size={14} /> Check
          </button>
        </div>

        {/* Sound & Animation toggles */}
        <div className="grid grid-cols-2 gap-2 md:gap-2.5">
          <button
            onClick={() => onToggleSound(!soundEnabled)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs md:text-sm font-medium transition-all ${
              soundEnabled
                ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Sound
          </button>
          <button
            onClick={onToggleAnimation}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs md:text-sm font-medium transition-all ${
              showAnimation
                ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showAnimation ? <Eye size={14} /> : <EyeOff size={14} />}
            {showAnimation ? 'Anim On' : 'Anim Off'}
          </button>
        </div>
      </div>

      {/* Animation Controls */}
      {showAnimation && steps.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Solver Steps</h3>
          <div className="flex gap-2 mb-3">
            <button onClick={onStepBack} disabled={stepIndex <= -1} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-2 py-2.5 text-xs md:text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={onAutoPlay} className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs md:text-sm font-medium transition-all ${isAnimating ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/30'}`}>
              {isAnimating ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
            </button>
            <button onClick={onStepForward} disabled={stepIndex >= stepsTotal - 1} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-2 py-2.5 text-xs md:text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              Next <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-1 mb-2">
            {speeds.map((s) => (
              <button key={s.value} onClick={() => onSetAnimSpeed(s.value)} className={`flex-1 rounded-md px-2 py-1.5 text-[10px] md:text-xs font-medium transition-all ${animSpeed === s.value ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/50 text-slate-500 hover:text-slate-400'}`}>
                {s.label}
              </button>
            ))}
          </div>
          {stepsTotal > 0 && (
            <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-500">
              <span>Step</span>
              <span className="font-mono font-semibold text-indigo-300">{Math.max(0, stepIndex + 1)} / {stepsTotal}</span>
            </div>
          )}
        </div>
      )}

      {/* Current Step Description */}
      {showAnimation && currentStep && (
        <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
          currentStep.action.type === 'found_win'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : currentStep.action.type === 'backtrack' || currentStep.action.type === 'pair_failed'
              ? 'border-amber-500/30 bg-amber-500/5'
              : currentStep.action.type === 'no_win'
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-slate-700/50 bg-slate-900/60'
        }`}>
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Current Step</h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{currentStep.description}</p>
        </div>
      )}

      {/* Result Summary */}
      {result && !showAnimation && (
        <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
          result.isWin ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div className="flex items-center gap-2">
            <Trophy size={16} className={result.isWin ? 'text-emerald-400' : 'text-red-400'} />
            <span className={`text-sm md:text-base font-bold ${result.isWin ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.isWin ? 'Winning Hand!' : 'Not a Winner'}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {lastError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-center text-xs md:text-sm font-medium text-red-400 animate-pulse">
          {lastError}
        </div>
      )}
    </div>
  );
}
