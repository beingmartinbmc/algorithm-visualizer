import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX } from 'lucide-react';
import type { LinkedListAlgoHook } from '../hooks/useLinkedListAlgo';
import type { LLProblem } from '../types/linkedListAlgo';
import { randomInputFor } from '../algorithms/randomInput';

interface Props {
  hook: LinkedListAlgoHook;
  problem: LLProblem;
}

export default function LinkedListAlgoControls({ hook, problem }: Props) {
  const {
    info, input, setInput, steps, stepIndex, currentStep, progress,
    isPlaying, speed, setSpeed, soundEnabled, toggleSound,
    run, togglePlay, next, prev, reset, canGoNext, canGoPrev,
  } = hook;

  const randomize = () => {
    const value = randomInputFor(problem);
    setInput(value);
    run(value);
  };

  return (
    <aside className="w-full space-y-4 xl:w-80 xl:shrink-0">
      {/* Input */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Input</h3>
        <label className="text-[11px] text-slate-500">{info.inputLabel}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-none rounded-xl bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-200 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50"
        />
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{info.helper}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => run()} className="rounded-xl bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/40 hover:bg-indigo-500/30">
            Build Steps
          </button>
          <button onClick={randomize} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
            <Shuffle size={13} /> Random
          </button>
        </div>
      </section>

      {/* Playback */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Playback</h3>
          <span className="font-mono text-xs text-indigo-300">{Math.min(stepIndex + 1, steps.length)} / {steps.length}</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Speed */}
        <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Animation Speed</span>
            <span className="font-mono text-[10px] text-indigo-300">{(speed / 1000).toFixed(2)}s</span>
          </div>
          {/* slider is reversed so dragging right = faster */}
          <input
            type="range"
            min={120}
            max={3000}
            step={20}
            value={3120 - speed}
            onChange={(e) => setSpeed(3120 - Number(e.target.value))}
            className="w-full accent-indigo-400"
            aria-label="Animation speed"
          />
          <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-slate-600">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* transport */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={prev} disabled={!canGoPrev} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-2 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 disabled:opacity-30">
            <ChevronLeft size={13} /> Back
          </button>
          <button
            onClick={togglePlay}
            className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold ring-1 ${
              isPlaying ? 'bg-amber-500/15 text-amber-300 ring-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
            }`}
          >
            {isPlaying ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
          </button>
          <button onClick={next} disabled={!canGoNext} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-2 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 disabled:opacity-30">
            Next <ChevronRight size={13} />
          </button>
        </div>
        <button onClick={reset} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
          <RotateCcw size={13} /> Reset
        </button>

        {/* current step description (mirror of canvas, handy on mobile) */}
        <p className="mt-3 min-h-10 text-xs leading-relaxed text-slate-300">{currentStep?.description}</p>
      </section>

      {/* Sound */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <button
          onClick={() => toggleSound(!soundEnabled)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${
            soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30' : 'bg-slate-800/70 text-slate-400 ring-slate-700/40'
          }`}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {info.tags.map((t) => (
            <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300 ring-1 ring-violet-500/20">{t}</span>
          ))}
        </div>
        <p className="mt-2 text-[10px] font-mono text-slate-500">{info.complexity}</p>
      </section>
    </aside>
  );
}
