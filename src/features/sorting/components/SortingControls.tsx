import {
  Square,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { SortingAlgorithmType, VisualizationSpeed } from '../types/sorting';
import { SORTING_ALGORITHM_INFO } from '../types/sorting';

interface SortingControlsProps {
  algorithm: SortingAlgorithmType;
  setAlgorithm: (a: SortingAlgorithmType) => void;
  speed: VisualizationSpeed;
  setSpeed: (s: VisualizationSpeed) => void;
  arraySize: number;
  changeArraySize: (size: number) => void;
  isRunning: boolean;
  isFinished: boolean;
  currentStep: number;
  totalSteps: number;
  soundEnabled: boolean;
  onToggleSound: (value: boolean) => void;
  onVisualize: () => void;
  onStop: () => void;
  onGenerateNewArray: () => void;
}

const algorithms: SortingAlgorithmType[] = ['bubble', 'selection', 'insertion', 'quick', 'heap', 'merge'];
const speeds: VisualizationSpeed[] = ['slow', 'medium', 'fast', 'instant'];

export default function SortingControls({
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  arraySize,
  changeArraySize,
  isRunning,
  isFinished,
  currentStep,
  totalSteps,
  soundEnabled,
  onToggleSound,
  onVisualize,
  onStop,
  onGenerateNewArray,
}: SortingControlsProps) {
  const info = SORTING_ALGORITHM_INFO[algorithm];

  return (
    <div className="flex flex-col gap-5 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Algorithm Selection */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Algorithm
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {algorithms.map((algo) => (
            <button
              key={algo}
              onClick={() => !isRunning && setAlgorithm(algo)}
              disabled={isRunning}
              className={`
                rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                ${
                  algorithm === algo
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {SORTING_ALGORITHM_INFO[algo].name}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-800/40 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">
              Time: {info.timeComplexity}
            </span>
            <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400 ring-1 ring-cyan-500/20">
              Space: {info.spaceComplexity}
            </span>
            {info.stable && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                Stable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Speed & Sound */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Speed
          </h3>
          <button
            onClick={() => onToggleSound(!soundEnabled)}
            className={`
              flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200
              ${soundEnabled
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/50 text-slate-500 hover:text-slate-400'
              }
            `}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
        </div>
        <div className="flex gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`
                flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-all duration-200
                ${
                  speed === s
                    ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Array Size */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Array Size
          </h3>
          <span className="text-xs font-mono text-slate-400">{arraySize}</span>
        </div>
        <input
          type="range"
          min="10"
          max="150"
          value={arraySize}
          onChange={(e) => !isRunning && changeArraySize(Number(e.target.value))}
          disabled={isRunning}
          className="w-full accent-indigo-500 disabled:opacity-50"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">10</span>
          <span className="text-[10px] text-slate-600">150</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {!isRunning ? (
          <button
            onClick={onVisualize}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Visualize {info.name}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          >
            <Square size={16} />
            Stop
          </button>
        )}

        <button
          onClick={onGenerateNewArray}
          disabled={isRunning}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shuffle size={12} />
          Generate New Array
        </button>
      </div>

      {/* Stats */}
      {(isRunning || isFinished) && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Operations</span>
              <span className="text-sm font-mono font-semibold text-indigo-400">
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Array Size</span>
              <span className="text-sm font-mono font-semibold text-amber-400">{arraySize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Status</span>
              <span className={`text-xs font-semibold ${isFinished ? 'text-emerald-400' : 'text-violet-400'}`}>
                {isFinished ? 'Sorted' : 'Sorting...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-indigo-400/80" />
            <span className="text-xs text-slate-400">Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-amber-400" />
            <span className="text-xs text-slate-400">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-rose-500" />
            <span className="text-xs text-slate-400">Swapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-emerald-500" />
            <span className="text-xs text-slate-400">Sorted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
