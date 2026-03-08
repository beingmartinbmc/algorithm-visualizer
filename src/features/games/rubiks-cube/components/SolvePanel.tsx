import type { SolveStep } from '../engine/types';
import { Pause, SkipForward, SkipBack, RotateCcw, Wand2, Turtle, Rabbit, Zap } from 'lucide-react';

const SPEED_PRESETS = [
  { label: 'Slow', value: 1000, icon: Turtle, color: 'from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500' },
  { label: 'Medium', value: 400, icon: Rabbit, color: 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500' },
  { label: 'Fast', value: 120, icon: Zap, color: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500' },
] as const;

interface SolvePanelProps {
  steps: SolveStep[];
  currentStep: number;
  isPlaying: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPause: () => void;
  onReset: () => void;
  onAutoSolve?: (speed: number) => void;
  speed: number;
  guidedPhase: string;
}

const PHASE_COLORS: Record<string, string> = {
  'Undo Last Moves': 'text-amber-400',
  'Restoring Middle': 'text-blue-400',
  'Final Restoration': 'text-emerald-400',
};

export default function SolvePanel({
  steps, currentStep, isPlaying, onStepForward, onStepBackward,
  onPause, onReset, onAutoSolve, speed, guidedPhase,
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

      {/* Auto Solve with speed presets */}
      {onAutoSolve && currentStep < steps.length - 1 && !isPlaying && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-semibold">
            <Wand2 size={10} /> Auto Solve
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SPEED_PRESETS.map(({ label, value, icon: Icon, color }) => (
              <button
                key={label}
                onClick={() => onAutoSolve(value)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-lg
                  bg-gradient-to-r ${color}
                  text-white text-[10px] font-semibold transition-all`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* During auto-solve, show pause */}
      {isPlaying && (
        <div className="flex items-center gap-2">
          <button
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
              bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500
              text-white text-xs font-semibold transition-all"
          >
            <Pause size={14} /> Pause
          </button>
          <div className="text-[10px] text-slate-500">
            {speed <= 150 ? '⚡ Fast' : speed <= 500 ? '🐇 Medium' : '🐢 Slow'}
          </div>
        </div>
      )}

      {/* Step controls */}
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
          disabled={currentStep < 0 || isPlaying}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step Back"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={onStepForward}
          disabled={currentStep >= steps.length - 1 || isPlaying}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500
            text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <SkipForward size={14} /> Next Step
        </button>
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
