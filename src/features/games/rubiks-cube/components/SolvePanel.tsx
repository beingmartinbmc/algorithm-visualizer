import type { SolveStep } from '../engine/types';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface SolvePanelProps {
  steps: SolveStep[];
  currentStep: number;
  isPlaying: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  guidedPhase: string;
}

const PHASE_COLORS: Record<string, string> = {
  'White Cross': 'text-white',
  'White Corners': 'text-slate-200',
  'Middle Layer': 'text-blue-400',
  'Yellow Cross': 'text-yellow-400',
  'Last Layer': 'text-yellow-300',
};

export default function SolvePanel({
  steps, currentStep, isPlaying, onStepForward, onStepBackward,
  onPlay, onPause, onReset, speed, onSpeedChange, guidedPhase,
}: SolvePanelProps) {
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const currentDesc = currentStep >= 0 && currentStep < steps.length
    ? steps[currentStep].description
    : steps.length > 0 ? 'Ready to start — press Play or Step Forward' : 'No solution loaded';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step-by-Step Solver</h3>

      {/* Phase indicator */}
      {guidedPhase && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase">Phase:</span>
          <span className={`text-xs font-bold ${PHASE_COLORS[guidedPhase] || 'text-slate-300'}`}>
            {guidedPhase}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{currentStep + 1} / {steps.length} moves</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current step description */}
      <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
        <p className="text-xs text-slate-300 leading-relaxed">{currentDesc}</p>
        {currentStep >= 0 && currentStep < steps.length && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-cyan-400">
              {steps[currentStep].move}
            </span>
            <span className="text-[10px] text-slate-500">
              {steps[currentStep].move.includes("'") ? '↺ Counter-clockwise' :
               steps[currentStep].move.includes('2') ? '↻ 180°' : '↻ Clockwise'}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onStepBackward}
          disabled={currentStep < 0}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step Back"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={steps.length === 0 || currentStep >= steps.length - 1}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500
            text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
        </button>
        <button
          onClick={onStepForward}
          disabled={currentStep >= steps.length - 1}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step Forward"
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Speed control */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Speed</span>
          <span>{speed}ms</span>
        </div>
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
        />
      </div>

      {/* Steps list */}
      {steps.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-900/50 border border-slate-800/50 divide-y divide-slate-800/30">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-[10px] transition-colors ${
                i === currentStep
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : i < currentStep + 1
                    ? 'text-slate-500 line-through'
                    : 'text-slate-400'
              }`}
            >
              <span className="font-mono font-bold w-8 shrink-0">{step.move}</span>
              <span className="truncate">{step.phase}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
