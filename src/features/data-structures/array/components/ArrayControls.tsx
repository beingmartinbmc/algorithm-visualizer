import { Plus, Trash2, Search, Shuffle, ChevronLeft, ChevronRight, RotateCcw, MousePointer } from 'lucide-react';
import { useArrayDS } from '../hooks/useArrayDS';

const speeds = [
  { label: 'Slow', value: 700 },
  { label: 'Med', value: 350 },
  { label: 'Fast', value: 120 },
];

interface ArrayControlsProps {
  hook: ReturnType<typeof useArrayDS>;
}

export default function ArrayControls({ hook }: ArrayControlsProps) {
  const {
    array, steps, stepIndex, inputValue, setInputValue,
    indexValue, setIndexValue, history, speed, setSpeed, isPlaying,
    access, insertAt, deleteAt, search, pushBack, clear, generateRandom,
    nextStep, prevStep, canGoNext, canGoPrev,
  } = hook;

  const handleAccess = () => {
    const i = parseInt(indexValue);
    if (!isNaN(i)) access(i);
  };
  const handleInsert = () => {
    const v = parseInt(inputValue);
    const i = parseInt(indexValue);
    if (!isNaN(v) && !isNaN(i)) { insertAt(v, i); setInputValue(''); }
  };
  const handleDelete = () => {
    const i = parseInt(indexValue);
    if (!isNaN(i)) deleteAt(i);
  };
  const handleSearch = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v)) search(v);
  };
  const handlePush = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v)) { pushBack(v); setInputValue(''); }
  };

  return (
    <div className="flex flex-col gap-4 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* About */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-indigo-300 mb-1">Array</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          A contiguous block of memory. <strong className="text-slate-300">Access</strong> by index is O(1), but <strong className="text-slate-300">insert/delete</strong> requires shifting elements — O(n).
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Access O(1)', 'Search O(n)', 'Insert O(n)', 'Delete O(n)'].map((t) => (
            <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">{t}</span>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Operations</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Value</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 42"
              className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Index</label>
            <input
              type="number"
              value={indexValue}
              onChange={(e) => setIndexValue(e.target.value)}
              placeholder="e.g. 0"
              min="0"
              className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAccess}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30 transition-all hover:bg-blue-500/30 active:scale-[0.98]"
          >
            <MousePointer size={13} /> Access
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30 transition-all hover:bg-amber-500/30 active:scale-[0.98]"
          >
            <Search size={13} /> Search
          </button>
          <button
            onClick={handleInsert}
            disabled={array.length >= 12}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/80 to-green-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Insert
          </button>
          <button
            onClick={handleDelete}
            disabled={array.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500/80 to-pink-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            onClick={handlePush}
            disabled={array.length >= 12}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-emerald-300 transition-all hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Push Back
          </button>
          <button
            onClick={clear}
            disabled={array.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} /> Clear
          </button>
        </div>
        <button
          onClick={generateRandom}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <Shuffle size={12} /> Random Array
        </button>
      </div>

      {/* Speed */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Animation Speed</h3>
        <div className="flex gap-1">
          {speeds.map((s) => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                speed === s.value
                  ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step Controls */}
      {steps.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Step Through</h3>
          <div className="flex gap-2">
            <button onClick={prevStep} disabled={!canGoPrev || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} /> Prev
            </button>
            <button onClick={nextStep} disabled={!canGoNext || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed">
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">{Math.max(0, stepIndex + 1)} / {steps.length}</span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">History</h3>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-600 w-4 text-right">{i + 1}</span>
                <span className={
                  h.startsWith('Insert') || h.startsWith('Push') ? 'text-emerald-400' :
                  h.startsWith('Delete') ? 'text-rose-400' :
                  h.startsWith('Search') ? 'text-amber-400' :
                  h.startsWith('Access') ? 'text-blue-400' : 'text-slate-400'
                }>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-blue-500" /><span className="text-xs text-slate-400">Access</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-amber-400" /><span className="text-xs text-slate-400">Search scan</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-400">Insert / found</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-rose-500" /><span className="text-xs text-slate-400">Delete</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-orange-400" /><span className="text-xs text-slate-400">Shift</span></div>
        </div>
      </div>
    </div>
  );
}
