import {
  RotateCcw,
  Map,
  Shuffle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Undo2,
  Volume2,
  VolumeX,
  Timer,
  Trophy,
  Route,
} from 'lucide-react';
import type { DijkstraGameMode, DijkstraStep } from '../types/dijkstra';
import { MODE_INFO, GAME_DESCRIPTION } from '../types/dijkstra';

interface DijkstraControlsProps {
  mode: DijkstraGameMode;
  mapType: 'predefined' | 'random';
  startNode: string | null;
  endNode: string | null;
  playerPath: string[];
  playerCost: number;
  optimalCost: number;
  showOptimal: boolean;
  currentAlgoStep: DijkstraStep | null;
  algoStepIndex: number;
  algoStepsTotal: number;
  isAlgoRunning: boolean;
  algoSpeed: number;
  score: number;
  timer: number;
  isComplete: boolean;
  lastError: string | null;
  soundEnabled: boolean;
  selectingPhase: 'start' | 'end' | 'path';
  onChangeMode: (mode: DijkstraGameMode) => void;
  onNewMap: (type: 'predefined' | 'random') => void;
  onReset: () => void;
  onToggleOptimal: () => void;
  onUndoLastStep: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onAutoPlay: () => void;
  onSetAlgoSpeed: (speed: number) => void;
  onToggleSound: (v: boolean) => void;
}

const modes: DijkstraGameMode[] = ['explore', 'visualize', 'race'];
const speeds = [
  { label: 'Slow', value: 800 },
  { label: 'Med', value: 400 },
  { label: 'Fast', value: 150 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DijkstraControls({
  mode,
  startNode,
  endNode,
  playerPath,
  playerCost,
  optimalCost,
  showOptimal,
  currentAlgoStep,
  algoStepIndex,
  algoStepsTotal,
  isAlgoRunning,
  algoSpeed,
  score,
  timer,
  isComplete,
  lastError,
  soundEnabled,
  selectingPhase: _selectingPhase,
  onChangeMode,
  onNewMap,
  onReset,
  onToggleOptimal,
  onUndoLastStep,
  onStepForward,
  onStepBack,
  onAutoPlay,
  onSetAlgoSpeed,
  onToggleSound,
}: DijkstraControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Game Info */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-indigo-300 mb-1">{GAME_DESCRIPTION.title}</h3>
        <p className="text-[10px] text-slate-500 italic mb-2">{GAME_DESCRIPTION.subtitle}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{GAME_DESCRIPTION.what}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GAME_DESCRIPTION.skills.map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Game Mode</h3>
        <div className="flex gap-1">
          {modes.map((m) => (
            <button key={m} onClick={() => onChangeMode(m)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ${mode === m ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'}`}>
              {MODE_INFO[m].name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">{MODE_INFO[mode].description}</p>
      </div>

      {/* Map Controls */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Map</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onNewMap('predefined')} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <Map size={12} /> Preset
          </button>
          <button onClick={() => onNewMap('random')} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <Shuffle size={12} /> Random
          </button>
        </div>
      </div>

      {/* Algo Controls (Visualize mode) */}
      {mode === 'visualize' && startNode && endNode && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Algorithm</h3>
          <div className="flex gap-2 mb-3">
            <button onClick={onStepBack} disabled={algoStepIndex <= 0} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-2 py-2 text-xs font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={onAutoPlay} className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${isAlgoRunning ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/30'}`}>
              {isAlgoRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
            </button>
            <button onClick={onStepForward} disabled={algoStepIndex >= algoStepsTotal - 1} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-2 py-2 text-xs font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              Next <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-1 mb-2">
            {speeds.map((s) => (
              <button key={s.value} onClick={() => onSetAlgoSpeed(s.value)} className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all ${algoSpeed === s.value ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/50 text-slate-500 hover:text-slate-400'}`}>
                {s.label}
              </button>
            ))}
          </div>
          {algoStepsTotal > 0 && (
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Step</span>
              <span className="font-mono font-semibold text-indigo-300">{Math.max(0, algoStepIndex + 1)} / {algoStepsTotal}</span>
            </div>
          )}
        </div>
      )}

      {/* Path Info & Costs */}
      {startNode && endNode && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Route Info</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Route size={11} /> Your Cost</span>
              <span className="text-sm font-mono font-bold text-indigo-300">{playerCost > 0 || isComplete ? playerCost : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Route size={11} /> Optimal</span>
              <span className={`text-sm font-mono font-bold ${showOptimal ? 'text-emerald-300' : 'text-slate-600'}`}>{showOptimal ? optimalCost : '???'}</span>
            </div>
            {isComplete && playerCost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Difference</span>
                <span className={`text-sm font-mono font-bold ${playerCost === optimalCost ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {playerCost === optimalCost ? 'Perfect!' : `+${playerCost - optimalCost}`}
                </span>
              </div>
            )}
            {mode === 'race' && isComplete && (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500"><Timer size={11} /> Time</span>
                  <span className="text-sm font-mono font-bold text-sky-300">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500"><Trophy size={11} /> Score</span>
                  <span className="text-sm font-mono font-bold text-amber-300">{score}</span>
                </div>
              </>
            )}
          </div>
          {playerPath.length > 0 && mode !== 'visualize' && (
            <div className="mt-3">
              <p className="text-[10px] text-slate-500 mb-1">Your path:</p>
              <div className="flex flex-wrap gap-1">
                {playerPath.map((id, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300 ring-1 ring-indigo-500/20">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Description (Visualize) */}
      {mode === 'visualize' && currentAlgoStep && (
        <div className={`rounded-xl border p-4 backdrop-blur-sm ${currentAlgoStep.type === 'relax' ? 'border-amber-500/30 bg-amber-500/5' : currentAlgoStep.type === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-900/60'}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Current Step</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{currentAlgoStep.description}</p>
          {currentAlgoStep.queue.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-slate-500 mb-1">Priority Queue:</p>
              <div className="flex flex-wrap gap-1">
                {currentAlgoStep.queue.sort((a, b) => a.distance - b.distance).map((item) => (
                  <span key={item.id} className="inline-flex items-center rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono text-sky-300 ring-1 ring-sky-500/20">
                    {item.id}:{item.distance}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {lastError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-center text-xs font-medium text-red-400 animate-pulse">
          {lastError}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onReset} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
          <RotateCcw size={12} /> Reset
        </button>
        {mode !== 'visualize' && (
          <button onClick={onUndoLastStep} disabled={playerPath.length <= 1 || isComplete} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
            <Undo2 size={12} /> Undo
          </button>
        )}
        {mode !== 'visualize' && startNode && endNode && (
          <button onClick={onToggleOptimal} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${showOptimal ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'}`}>
            {showOptimal ? <Eye size={12} /> : <EyeOff size={12} />} Best
          </button>
        )}
        <button onClick={() => onToggleSound(!soundEnabled)} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'}`}>
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />} Sound
        </button>
      </div>
    </div>
  );
}
