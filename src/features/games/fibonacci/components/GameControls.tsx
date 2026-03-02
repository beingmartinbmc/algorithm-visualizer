import {
  RotateCcw,
  Lightbulb,
  LightbulbOff,
  Timer,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { GameMode } from '../types/fibonacci';
import { MODE_INFO, GAME_DESCRIPTION } from '../types/fibonacci';

interface GameControlsProps {
  mode: GameMode;
  score: number;
  streak: number;
  timer: number;
  isComplete: boolean;
  showHint: boolean;
  sequence: number[];
  expectedNext: number;
  soundEnabled: boolean;
  onChangeMode: (mode: GameMode) => void;
  onReset: () => void;
  onToggleHint: () => void;
  onToggleSound: (v: boolean) => void;
}

const modes: GameMode[] = ['guided', 'challenge', 'sandbox'];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GameControls({
  mode,
  score,
  streak,
  timer,
  isComplete,
  showHint,
  sequence,
  expectedNext,
  soundEnabled,
  onChangeMode,
  onReset,
  onToggleHint,
  onToggleSound,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full md:w-72 md:shrink-0 md:overflow-y-auto md:max-h-full pr-1">
      {/* Game Info */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-indigo-300 mb-1">{GAME_DESCRIPTION.title}</h3>
        <p className="text-[10px] text-slate-500 italic mb-2">{GAME_DESCRIPTION.subtitle}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{GAME_DESCRIPTION.what}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GAME_DESCRIPTION.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Game Mode
        </h3>
        <div className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => onChangeMode(m)}
              className={`
                flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200
                ${mode === m
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {MODE_INFO[m].name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
          {MODE_INFO[mode].description}
        </p>
      </div>

      {/* Score & Stats (Challenge) */}
      {mode === 'challenge' && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Stats
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Trophy size={12} /> Score
              </span>
              <span className="text-sm font-mono font-bold text-amber-300">{score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Flame size={12} /> Streak
              </span>
              <span className="text-sm font-mono font-bold text-orange-400">{streak}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Timer size={12} /> Time
              </span>
              <span className="text-sm font-mono font-bold text-sky-300">{formatTime(timer)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {(mode === 'guided' || showHint) && !isComplete && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 mb-2">
            Hint
          </h3>
          <p className="text-xs text-amber-300/70 font-mono leading-relaxed">
            F({sequence.length}) = F({sequence.length - 1}) + F({sequence.length - 2})
          </p>
          <p className="text-xs text-amber-300/70 font-mono">
            = {sequence[sequence.length - 1]} + {sequence[sequence.length - 2]} = <span className="font-bold text-amber-200">{expectedNext}</span>
          </p>
        </div>
      )}

      {/* Sequence */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Sequence
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {sequence.map((val, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center rounded-md bg-indigo-500/15 px-2 py-1 text-xs font-mono font-semibold text-indigo-300 ring-1 ring-indigo-500/20"
            >
              {val}
            </span>
          ))}
          {!isComplete && (
            <span className="inline-flex items-center justify-center rounded-md bg-slate-800/50 px-2 py-1 text-xs font-mono text-slate-600 ring-1 ring-slate-700/30">
              ?
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <RotateCcw size={12} />
          Reset
        </button>
        <button
          onClick={onToggleHint}
          className={`
            flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all
            ${showHint
              ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            }
          `}
        >
          {showHint ? <Lightbulb size={12} /> : <LightbulbOff size={12} />}
          Hints
        </button>
        <button
          onClick={() => onToggleSound(!soundEnabled)}
          className={`
            flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all
            ${soundEnabled
              ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            }
          `}
        >
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          Sound
        </button>
      </div>
    </div>
  );
}
