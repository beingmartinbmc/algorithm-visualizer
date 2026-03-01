import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Shuffle,
} from 'lucide-react';
import type { TreeType } from '../types/balancedTree';
import { TREE_TYPE_INFO } from '../types/balancedTree';

interface BalancedTreeControlsProps {
  treeType: TreeType;
  changeTreeType: (t: TreeType) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  description: string;
  stepIndex: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  history: string[];
  speed: number;
  setSpeed: (s: number) => void;
  isPlaying: boolean;
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onGenerateRandom: () => void;
}

const speeds = [
  { label: 'Slow', value: 600 },
  { label: 'Medium', value: 300 },
  { label: 'Fast', value: 100 },
];

const treeTypes: TreeType[] = ['bst', 'avl', 'rbtree'];

export default function BalancedTreeControls({
  treeType,
  changeTreeType,
  inputValue,
  setInputValue,
  description,
  stepIndex,
  totalSteps,
  canGoNext,
  canGoPrev,
  history,
  speed,
  setSpeed,
  isPlaying,
  onInsert,
  onDelete,
  onNextStep,
  onPrevStep,
  onGenerateRandom,
}: BalancedTreeControlsProps) {
  const info = TREE_TYPE_INFO[treeType];

  const handleInsert = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v) && v > 0) { onInsert(v); setInputValue(''); }
  };

  const handleDelete = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v) && v > 0) { onDelete(v); setInputValue(''); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInsert();
  };

  return (
    <div className="flex flex-col gap-5 w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Tree Type */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Tree Type
        </h3>
        <div className="flex gap-2">
          {treeTypes.map((t) => (
            <button
              key={t}
              onClick={() => changeTreeType(t)}
              className={`
                flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200
                ${treeType === t
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {t === 'rbtree' ? 'RB Tree' : t.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-slate-800/40 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {info.properties.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Speed */}
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
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Operations
        </h3>
        <input
          type="number"
          min="1"
          max="999"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter value..."
          disabled={isPlaying}
          className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleInsert}
            disabled={isPlaying}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/80 to-green-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Insert
          </button>
          <button
            onClick={handleDelete}
            disabled={isPlaying}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500/80 to-pink-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
            Delete
          </button>
        </div>
        <button
          onClick={onGenerateRandom}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <Shuffle size={12} />
          Random Tree
        </button>
      </div>

      {/* Step Controls */}
      {totalSteps > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Step Through
          </h3>
          {description && (
            <p className="mb-3 rounded-lg bg-slate-800/40 p-2 text-xs text-indigo-300 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onPrevStep}
              disabled={!canGoPrev || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              onClick={onNextStep}
              disabled={!canGoNext || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">
              {Math.max(0, stepIndex + 1)} / {totalSteps}
            </span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            History
          </h3>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-600 w-4 text-right">{i + 1}</span>
                <span className={h.startsWith('Insert') ? 'text-emerald-400' : 'text-rose-400'}>
                  {h}
                </span>
              </div>
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
            <span className="text-xs text-slate-400">Highlighted Node</span>
          </div>
          {treeType === 'rbtree' && (
            <>
              <div className="flex items-center gap-2">
                <div className="h-3 w-5 rounded-sm bg-red-600" />
                <span className="text-xs text-slate-400">Red Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-5 rounded-sm bg-slate-800 ring-1 ring-slate-600" />
                <span className="text-xs text-slate-400">Black Node</span>
              </div>
            </>
          )}
          {treeType === 'avl' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">h3</span>
              <span className="text-xs text-slate-400">Height label</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
