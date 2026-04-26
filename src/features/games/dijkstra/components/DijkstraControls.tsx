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
  mapType,
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
  selectingPhase,
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
  const phaseLabel = selectingPhase === 'start'
    ? 'Choose depot'
    : selectingPhase === 'end'
      ? 'Choose destination'
      : mode === 'visualize'
        ? 'Run algorithm scan'
        : 'Build delivery route';

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto pr-1 xl:w-80">
      {/* Game Info */}
      <div className="rounded-2xl border border-sky-500/20 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-sky-200">{GAME_DESCRIPTION.title}</h3>
            <p className="text-[10px] text-slate-500 italic">{GAME_DESCRIPTION.subtitle}</p>
          </div>
          <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-sky-300 ring-1 ring-sky-500/25">
            Dispatch
          </span>
        </div>
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
      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Game Mode</h3>
        <div className="grid gap-2">
          {modes.map((m) => (
            <button key={m} onClick={() => onChangeMode(m)} className={`rounded-xl px-3 py-2 text-left transition-all duration-200 ${mode === m ? 'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/40' : 'bg-slate-900/70 text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80 hover:text-slate-300'}`}>
              <span className="block text-xs font-bold">{MODE_INFO[m].name}</span>
              <span className="mt-0.5 block text-[10px] leading-snug opacity-70">{MODE_INFO[m].description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Map</h3>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-mono uppercase text-slate-400 ring-1 ring-slate-800">
            {mapType}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onNewMap('predefined')} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${mapType === 'predefined' ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30' : 'bg-slate-900/70 text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80 hover:text-slate-300'}`}>
            <Map size={12} /> Preset
          </button>
          <button onClick={() => onNewMap('random')} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${mapType === 'random' ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30' : 'bg-slate-900/70 text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80 hover:text-slate-300'}`}>
            <Shuffle size={12} /> Random
          </button>
        </div>
      </div>

      {/* Mission */}
      <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mission</h3>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/25">
            {phaseLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MissionStop label="Depot" value={startNode ?? 'unset'} tone="yellow" />
          <MissionStop label="Dropoff" value={endNode ?? 'unset'} tone="orange" />
        </div>
        {playerPath.length > 0 && (
          <div className="mt-3 rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-800/80">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Route manifest</p>
            <div className="flex flex-wrap gap-1">
              {playerPath.map((id, i) => (
                <span key={`${id}-${i}`} className="inline-flex items-center rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300 ring-1 ring-indigo-500/20">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algo Controls (Visualize mode) */}
      {mode === 'visualize' && startNode && endNode && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Algorithm</h3>
          <div className="flex gap-2 mb-3">
            <button onClick={onStepBack} disabled={algoStepIndex <= 0} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-900/70 px-2 py-2 text-xs font-medium text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={onAutoPlay} className={`flex-1 flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all ${isAlgoRunning ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/30'}`}>
              {isAlgoRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
            </button>
            <button onClick={onStepForward} disabled={algoStepIndex >= algoStepsTotal - 1} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-900/70 px-2 py-2 text-xs font-medium text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
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
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
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
        </div>
      )}

      {/* Step Description (Visualize) */}
      {mode === 'visualize' && currentAlgoStep && (
        <div className={`rounded-2xl border p-4 shadow-xl shadow-black/20 backdrop-blur-sm ${currentAlgoStep.type === 'relax' ? 'border-amber-500/30 bg-amber-500/5' : currentAlgoStep.type === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-950/75'}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Current Step</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{currentAlgoStep.description}</p>
          {currentAlgoStep.queue.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-slate-500 mb-1">Priority Queue:</p>
              <div className="flex flex-wrap gap-1">
                {[...currentAlgoStep.queue].sort((a, b) => a.distance - b.distance).map((item) => (
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
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-center text-xs font-medium text-red-400 shadow-xl shadow-red-950/20 animate-pulse">
          {lastError}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onReset} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-400 ring-1 ring-slate-800 transition-all hover:bg-slate-800/80 hover:text-slate-300">
          <RotateCcw size={12} /> Reset
        </button>
        {mode !== 'visualize' && (
          <button onClick={onUndoLastStep} disabled={playerPath.length <= 1 || isComplete} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-400 ring-1 ring-slate-800 transition-all hover:bg-slate-800/80 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
            <Undo2 size={12} /> Undo
          </button>
        )}
        {mode !== 'visualize' && startNode && endNode && (
          <button onClick={onToggleOptimal} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${showOptimal ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-slate-950/80 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800/80 hover:text-slate-300'}`}>
            {showOptimal ? <Eye size={12} /> : <EyeOff size={12} />} Best
          </button>
        )}
        <button onClick={() => onToggleSound(!soundEnabled)} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-950/80 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800/80 hover:text-slate-300'}`}>
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />} Sound
        </button>
      </div>
    </div>
  );
}

function MissionStop({ label, value, tone }: { label: string; value: string; tone: 'yellow' | 'orange' }) {
  const tones = {
    yellow: 'text-yellow-300 ring-yellow-500/25 bg-yellow-500/10',
    orange: 'text-orange-300 ring-orange-500/25 bg-orange-500/10',
  };
  return (
    <div className={`rounded-xl p-3 ring-1 ${tones[tone]}`}>
      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-65">{label}</div>
      <div className="mt-1 font-mono text-lg font-black">{value}</div>
    </div>
  );
}
