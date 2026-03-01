import {
  Play,
  Square,
  RotateCcw,
  Paintbrush,
  Eraser,
  MapPin,
  Flag,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { AlgorithmType, VisualizationSpeed } from '../../types/graph';
import { ALGORITHM_INFO } from '../../types/graph';
import type { DrawMode } from '../../hooks/useGrid';

interface ControlsProps {
  algorithm: AlgorithmType;
  setAlgorithm: (a: AlgorithmType) => void;
  speed: VisualizationSpeed;
  setSpeed: (s: VisualizationSpeed) => void;
  drawMode: DrawMode;
  setDrawMode: (m: DrawMode) => void;
  isRunning: boolean;
  isFinished: boolean;
  visitedCount: number;
  pathLength: number;
  onVisualize: () => void;
  onStop: () => void;
  onReset: () => void;
  onClearVisualization: () => void;
  onGenerateMaze: () => void;
  soundEnabled: boolean;
  onToggleSound: (value: boolean) => void;
}

const algorithms: AlgorithmType[] = ['bfs', 'dfs', 'dijkstra', 'astar'];
const speeds: VisualizationSpeed[] = ['slow', 'medium', 'fast', 'instant'];

const drawTools: { mode: DrawMode; label: string; icon: typeof Paintbrush }[] = [
  { mode: 'wall', label: 'Wall', icon: Paintbrush },
  { mode: 'eraser', label: 'Eraser', icon: Eraser },
  { mode: 'start', label: 'Start', icon: MapPin },
  { mode: 'end', label: 'End', icon: Flag },
];

export default function Controls({
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  drawMode,
  setDrawMode,
  isRunning,
  isFinished,
  visitedCount,
  pathLength,
  onVisualize,
  onStop,
  onReset,
  onClearVisualization,
  onGenerateMaze,
  soundEnabled,
  onToggleSound,
}: ControlsProps) {
  const info = ALGORITHM_INFO[algorithm];

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
              {ALGORITHM_INFO[algo].name.split(' ').length > 2
                ? ALGORITHM_INFO[algo].name.split(' ').slice(0, -1).join(' ')
                : ALGORITHM_INFO[algo].name}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-800/40 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
          <div className="mt-2 flex gap-2">
            {info.guaranteesShortestPath && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                Shortest Path
              </span>
            )}
            {info.weighted && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-amber-500/20">
                Weighted
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

      {/* Drawing Tools */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {drawTools.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setDrawMode(mode)}
              disabled={isRunning}
              className={`
                flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                ${
                  drawMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
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

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onClearVisualization}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={12} />
            Clear
          </button>
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={onGenerateMaze}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle size={12} />
            Maze
          </button>
        </div>
      </div>

      {/* Stats */}
      {(isRunning || isFinished) && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Nodes Visited</span>
              <span className="text-sm font-mono font-semibold text-indigo-400">{visitedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Path Length</span>
              <span className="text-sm font-mono font-semibold text-amber-400">
                {pathLength > 0 ? pathLength : isFinished ? 'No path' : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
