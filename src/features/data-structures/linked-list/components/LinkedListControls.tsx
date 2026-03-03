import { Plus, Trash2, Search, Shuffle, ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useLinkedList } from '../hooks/useLinkedList';

const speeds = [
  { label: 'Slow', value: 700 },
  { label: 'Med', value: 350 },
  { label: 'Fast', value: 120 },
];

interface LinkedListControlsProps {
  hook: ReturnType<typeof useLinkedList>;
}

export default function LinkedListControls({ hook }: LinkedListControlsProps) {
  const {
    nodes, steps, stepIndex, inputValue, setInputValue,
    indexValue, setIndexValue, history, speed, setSpeed, isPlaying,
    prepend, append, insertAt, deleteAt, search, clear, generateRandom,
    nextStep, prevStep, canGoNext, canGoPrev, soundEnabled, toggleSound,
  } = hook;

  const handlePrepend = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v)) { prepend(v); setInputValue(''); }
  };
  const handleAppend = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v)) { append(v); setInputValue(''); }
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

  return (
    <div className="flex flex-col gap-4 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* About */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-indigo-300 mb-1">Linked List</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          A chain of <strong className="text-slate-300">nodes</strong>, each holding a value and a pointer to the next node. No random access — traversal is required for index-based operations.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Prepend O(1)', 'Append O(n)', 'Insert O(n)', 'Delete O(n)', 'Search O(n)'].map((t) => (
            <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">{t}</span>
          ))}
        </div>
      </div>

      {/* Operations */}
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
            onClick={handlePrepend}
            disabled={nodes.length >= 12}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/80 to-green-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Prepend
          </button>
          <button
            onClick={handleAppend}
            disabled={nodes.length >= 12}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Append
          </button>
          <button
            onClick={handleInsert}
            disabled={nodes.length >= 12}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-500/20 px-3 py-2 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/30 transition-all hover:bg-violet-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Insert at
          </button>
          <button
            onClick={handleDelete}
            disabled={nodes.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500/80 to-pink-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} /> Delete at
          </button>
          <button
            onClick={handleSearch}
            disabled={nodes.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30 transition-all hover:bg-amber-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search size={13} /> Search
          </button>
          <button
            onClick={clear}
            disabled={nodes.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} /> Clear
          </button>
        </div>
        <button
          onClick={generateRandom}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <Shuffle size={12} /> Random List
        </button>
        <button
          onClick={() => toggleSound(!soundEnabled)}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            soundEnabled
              ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
          }`}
        >
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
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
                  h.startsWith('Prepend') || h.startsWith('Append') || h.startsWith('Insert') ? 'text-emerald-400' :
                  h.startsWith('Delete') ? 'text-rose-400' :
                  h.startsWith('Search') ? 'text-amber-400' : 'text-slate-400'
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
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-400">Insert / found</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-rose-500" /><span className="text-xs text-slate-400">Delete</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-amber-400" /><span className="text-xs text-slate-400">Traversal / search</span></div>
        </div>
      </div>
    </div>
  );
}
