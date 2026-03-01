import {
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  Shuffle,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { TraversalType } from '../types/tree';
import { TRAVERSAL_INFO } from '../types/tree';

interface TraversalControlsProps {
  traversalType: TraversalType;
  setTraversalType: (t: TraversalType) => void;
  nodeCount: number;
  stepIndex: number;
  totalSteps: number;
  processOrder: number[];
  isPlaying: boolean;
  isFinished: boolean;
  speed: number;
  setSpeed: (s: number) => void;
  soundEnabled: boolean;
  onToggleSound: (v: boolean) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onGenerate: (count?: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
}

const traversalTypes: TraversalType[] = ['inorder', 'preorder', 'postorder', 'levelorder'];
const speeds = [
  { label: 'Slow', value: 600 },
  { label: 'Medium', value: 300 },
  { label: 'Fast', value: 100 },
];

export default function TraversalControls({
  traversalType,
  setTraversalType,
  nodeCount,
  stepIndex,
  totalSteps,
  processOrder,
  isPlaying,
  isFinished,
  speed,
  setSpeed,
  soundEnabled,
  onToggleSound,
  canGoNext,
  canGoPrev,
  onGenerate,
  onNextStep,
  onPrevStep,
  onPlay,
  onStop,
  onReset,
}: TraversalControlsProps) {
  const info = TRAVERSAL_INFO[traversalType];

  return (
    <div className="flex flex-col gap-5 w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Traversal Type */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Traversal
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {traversalTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTraversalType(t)}
              disabled={isPlaying}
              className={`
                rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                ${traversalType === t
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {TRAVERSAL_INFO[t].name}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-800/40 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">
            {info.order}
          </span>
        </div>
      </div>

      {/* Speed & Sound */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Speed</h3>
        <div className="flex gap-1">
          {speeds.map((s) => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`
                flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200
                ${speed === s.value
                  ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onToggleSound(!soundEnabled)}
          className={`
            mt-3 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200
            ${soundEnabled
              ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
              : 'bg-slate-800/50 text-slate-500 ring-1 ring-slate-700/30'
            }
          `}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* Tree Size */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nodes</h3>
          <span className="text-xs font-mono text-slate-400">{nodeCount}</span>
        </div>
        <input
          type="range"
          min="3"
          max="31"
          value={nodeCount}
          onChange={(e) => !isPlaying && onGenerate(Number(e.target.value))}
          disabled={isPlaying}
          className="w-full accent-indigo-500 disabled:opacity-50"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">3</span>
          <span className="text-[10px] text-slate-600">31</span>
        </div>
      </div>

      {/* Step Controls */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={onPrevStep}
            disabled={!canGoPrev || isPlaying}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={isFinished}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={14} />
              Play
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:brightness-110"
            >
              <Square size={14} />
              Stop
            </button>
          )}
          <button
            onClick={onNextStep}
            disabled={!canGoNext || isPlaying || isFinished}
            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
        {totalSteps > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">
              {Math.max(0, stepIndex + 1)} / {totalSteps}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onGenerate()}
          disabled={isPlaying}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shuffle size={12} />
          New Tree
        </button>
        <button
          onClick={onReset}
          disabled={isPlaying}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Process Order */}
      {processOrder.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Visit Order
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {processOrder.map((nodeId, idx) => (
              <span
                key={idx}
                className="inline-flex items-center justify-center rounded-md bg-indigo-500/15 px-2 py-1 text-xs font-mono font-semibold text-indigo-300 ring-1 ring-indigo-500/20"
              >
                {nodeId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-amber-400" />
            <span className="text-xs text-slate-400">Current Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-indigo-500" />
            <span className="text-xs text-slate-400">Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-slate-600" />
            <span className="text-xs text-slate-400">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-slate-800 ring-1 ring-slate-600" />
            <span className="text-xs text-slate-400">Unvisited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
