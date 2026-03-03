import { Plus, Trash2, Eye, Shuffle, ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useStack } from '../hooks/useStack';

const speeds = [
  { label: 'Slow', value: 700 },
  { label: 'Med', value: 350 },
  { label: 'Fast', value: 120 },
];

interface StackControlsProps {
  hook: ReturnType<typeof useStack>;
}

export default function StackControls({ hook }: StackControlsProps) {
  const {
    stack, steps, stepIndex, inputValue, setInputValue, history,
    speed, setSpeed, isPlaying, push, pop, peek, clear, generateRandom,
    nextStep, prevStep, canGoNext, canGoPrev, soundEnabled, toggleSound,
  } = hook;

  const handlePush = () => {
    const v = parseInt(inputValue);
    if (!isNaN(v)) { push(v); setInputValue(''); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePush();
  };

  return (
    <div className="flex flex-col gap-4 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* About */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-indigo-300 mb-1">Stack</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          A <strong className="text-slate-300">LIFO</strong> (Last In, First Out) structure. Elements are pushed onto and popped from the same end — the <strong className="text-slate-300">top</strong>.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['LIFO', 'Push O(1)', 'Pop O(1)', 'Peek O(1)'].map((t) => (
            <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">{t}</span>
          ))}
        </div>
      </div>

      {/* Operations */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Operations</h3>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter value..."
          className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50 transition-all"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handlePush}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/80 to-green-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/15 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Plus size={14} /> Push
          </button>
          <button
            onClick={pop}
            disabled={stack.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500/80 to-pink-500/80 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/15 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} /> Pop
          </button>
          <button
            onClick={peek}
            disabled={stack.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-amber-300 transition-all hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye size={14} /> Peek
          </button>
          <button
            onClick={clear}
            disabled={stack.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>
        <button
          onClick={generateRandom}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <Shuffle size={12} /> Random Stack
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
            <button
              onClick={prevStep}
              disabled={!canGoPrev || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={nextStep}
              disabled={!canGoNext || isPlaying}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">
              {Math.max(0, stepIndex + 1)} / {steps.length}
            </span>
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
                <span className={h.startsWith('Push') ? 'text-emerald-400' : h.startsWith('Pop') ? 'text-rose-400' : h.startsWith('Peek') ? 'text-amber-400' : 'text-slate-400'}>
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
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-400">Push</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-rose-500" /><span className="text-xs text-slate-400">Pop</span></div>
          <div className="flex items-center gap-2"><div className="h-3 w-5 rounded-sm bg-amber-400" /><span className="text-xs text-slate-400">Peek</span></div>
        </div>
      </div>
    </div>
  );
}
