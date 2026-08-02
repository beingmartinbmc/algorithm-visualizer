import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Braces,
  CheckCircle2,
  CircleStop,
  Gauge,
  MemoryStick,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  CODE_LIMITS,
  CodeGuardrailError,
  visualizeCode,
  type TraceFrame,
  type VisualValue,
  type VisualizationResult,
} from './engine/visualizeCode';

interface CodeSample {
  name: string;
  code: string;
}

const SAMPLES: CodeSample[] = [
  {
    name: 'Bubble sort',
    code: `const numbers = [7, 3, 9, 1, 5];

for (let pass = 0; pass < numbers.length; pass++) {
  for (let i = 0; i < numbers.length - pass - 1; i++) {
    if (numbers[i] > numbers[i + 1]) {
      const temp = numbers[i];
      numbers[i] = numbers[i + 1];
      numbers[i + 1] = temp;
    }
  }
}

console.log("sorted", numbers);`,
  },
  {
    name: 'Binary search',
    code: `const numbers = [2, 5, 8, 12, 16, 23, 38];
const target = 23;
let low = 0;
let high = numbers.length - 1;
let found = -1;

while (low <= high) {
  const middle = Math.floor((low + high) / 2);
  if (numbers[middle] === target) {
    found = middle;
    break;
  }
  if (numbers[middle] < target) low = middle + 1;
  else high = middle - 1;
}

console.log("index", found);`,
  },
  {
    name: 'Fibonacci',
    code: `const sequence = [0, 1];

for (let i = 2; i < 10; i++) {
  sequence.push(sequence[i - 1] + sequence[i - 2]);
}

console.log(sequence);`,
  },
];

function formatValue(value: VisualValue): string {
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'string') return `“${value}”`;
  return String(value);
}

function Guardrail({ icon: Icon, title, value }: { icon: typeof ShieldCheck; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
      <Icon size={14} className="text-emerald-300" />
      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{title}</p>
      <p className="mt-1 text-xs font-medium text-slate-300">{value}</p>
    </div>
  );
}

function ArrayVisualization({ frame }: { frame: TraceFrame }) {
  const arrayEntry = Object.entries(frame.variables).find(
    (entry): entry is [string, number[]] => Array.isArray(entry[1]) && entry[1].length > 0 && entry[1].every((value) => typeof value === 'number'),
  );
  if (!arrayEntry) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
        <div>
          <Braces size={24} className="mx-auto text-slate-700" />
          <p className="mt-3 text-xs text-slate-500">Add a numeric array to see a bar visualization.</p>
        </div>
      </div>
    );
  }

  const [name, values] = arrayEntry;
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs font-semibold text-emerald-200">{name}</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{values.length} items</p>
      </div>
      <div className="flex h-48 items-end gap-1.5 sm:gap-2" role="img" aria-label={`${name} array values: ${values.join(', ')}`}>
        {values.map((value, index) => (
          <div key={index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="font-mono text-[9px] text-slate-500">{value}</span>
            <span
              className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/70 to-teal-300 shadow-[0_0_18px_rgb(52_211_153_/_0.12)] transition-[height] duration-300"
              style={{ height: `${Math.max(8, (Math.abs(value) / max) * 100)}%` }}
            />
            <span className="font-mono text-[8px] text-slate-700">{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CodeVisualizerPage() {
  const [source, setSource] = useState(SAMPLES[0].code);
  const [result, setResult] = useState<VisualizationResult>(() => visualizeCode(SAMPLES[0].code));
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frame = result.frames[frameIndex] ?? result.frames[0];
  const previousFrame = result.frames[Math.max(0, frameIndex - 1)];
  const lines = source.split(/\r?\n/);
  const changedVariables = useMemo(() => {
    if (!frame || !previousFrame || frameIndex === 0) return new Set(Object.keys(frame?.variables ?? {}));
    return new Set(
      Object.keys(frame.variables).filter(
        (name) => JSON.stringify(frame.variables[name]) !== JSON.stringify(previousFrame.variables[name]),
      ),
    );
  }, [frame, frameIndex, previousFrame]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrameIndex((index) => {
        if (index >= result.frames.length - 1) {
          setPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [playing, result.frames.length]);

  const run = (nextSource = source) => {
    try {
      const nextResult = visualizeCode(nextSource);
      setResult(nextResult);
      setFrameIndex(0);
      setPlaying(false);
      setError(null);
    } catch (caught) {
      setPlaying(false);
      setError(caught instanceof CodeGuardrailError ? caught.message : 'The visualizer could not read this code.');
    }
  };

  const loadSample = (sample: CodeSample) => {
    setSource(sample.code);
    run(sample.code);
  };

  const goToFrame = (index: number) => {
    setPlaying(false);
    setFrameIndex(Math.max(0, Math.min(result.frames.length - 1, index)));
  };

  return (
    <div className="book-page flex-1 overflow-y-auto">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
              <ShieldCheck size={13} /> Safe code lab
            </div>
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Visualize your code</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Enter a small JavaScript algorithm, then play through every state change. The interpreter supports variables, arrays, conditions, and bounded loops without executing arbitrary browser code.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Guardrail icon={CircleStop} title="Source" value={`${CODE_LIMITS.sourceLines} lines`} />
            <Guardrail icon={Gauge} title="Trace" value={`${CODE_LIMITS.traceFrames} steps`} />
            <Guardrail icon={MemoryStick} title="Memory" value={`${CODE_LIMITS.totalCells} cells`} />
            <Guardrail icon={ShieldCheck} title="Runtime" value="No eval" />
          </div>
        </header>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
          <section className="book-panel overflow-hidden" aria-labelledby="editor-title">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">Input</p>
                <h2 id="editor-title" className="mt-0.5 text-sm font-semibold text-white">JavaScript subset</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLES.map((sample) => (
                  <button key={sample.name} type="button" onClick={() => loadSample(sample)} className="rounded-lg bg-white/[0.045] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 ring-1 ring-white/[0.07] hover:text-white">
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-[#080d18]">
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                spellCheck={false}
                aria-label="Code to visualize"
                className="h-[500px] w-full resize-y bg-transparent p-4 font-mono text-[12px] leading-6 text-slate-300 outline-none placeholder:text-slate-700 sm:p-5"
              />
              <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-slate-950/90 px-2 py-1 font-mono text-[9px] text-slate-600 ring-1 ring-white/[0.06]">
                {lines.length}/{CODE_LIMITS.sourceLines} lines · {source.length}/{CODE_LIMITS.sourceCharacters} chars
              </div>
            </div>

            <div className="border-t border-white/[0.07] p-4">
              {error && (
                <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/8 p-3 text-xs leading-5 text-rose-200">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <button type="button" onClick={() => run()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-200">
                <Sparkles size={16} /> Build visualization
              </button>
              <p className="mt-3 text-[10px] leading-5 text-slate-600">
                Supported: declarations, assignment, arrays, if/else, for, for…of, while, break/continue, console.log, basic Math, and safe array methods. Functions, objects, imports, network access, DOM access, recursion, and dynamic evaluation are rejected.
              </p>
            </div>
          </section>

          <section className="space-y-5" aria-label="Code visualization">
            <div className="book-panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">Execution trace</p>
                  <h2 className="mt-0.5 text-sm font-semibold text-white">Step {frameIndex + 1} of {result.frames.length}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => goToFrame(0)} aria-label="Restart visualization" className="trace-control"><RotateCcw size={14} /></button>
                  <button type="button" onClick={() => goToFrame(frameIndex - 1)} aria-label="Previous step" disabled={frameIndex === 0} className="trace-control"><ArrowLeft size={14} /></button>
                  <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause visualization' : 'Play visualization'} className="trace-control trace-control-primary">
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button type="button" onClick={() => goToFrame(frameIndex + 1)} aria-label="Next step" disabled={frameIndex === result.frames.length - 1} className="trace-control"><ArrowRight size={14} /></button>
                </div>
              </div>
              <div className="px-4 py-3">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, result.frames.length - 1)}
                  value={frameIndex}
                  onChange={(event) => goToFrame(Number(event.target.value))}
                  className="w-full accent-emerald-300"
                  aria-label="Visualization step"
                />
              </div>
            </div>

            {frame && (
              <>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="book-panel p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Current action</p>
                        <p className="mt-1 text-sm font-semibold text-white">{frame.description}</p>
                      </div>
                      <span className="rounded-lg bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] text-emerald-200 ring-1 ring-emerald-300/20">line {frame.line}</span>
                    </div>
                    <ArrayVisualization frame={frame} />
                  </div>

                  <div className="book-panel p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Variables</p>
                    <div className="mt-3 max-h-[315px] space-y-2 overflow-auto">
                      {Object.entries(frame.variables).map(([name, value]) => (
                        <div key={name} className={`rounded-xl border p-3 transition-colors ${changedVariables.has(name) ? 'border-emerald-300/20 bg-emerald-300/[0.06]' : 'border-white/[0.06] bg-black/10'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] font-semibold text-slate-400">{name}</span>
                            {changedVariables.has(name) && <CheckCircle2 size={11} className="text-emerald-300" />}
                          </div>
                          <p className="mt-1 break-all font-mono text-[11px] leading-5 text-slate-200">{formatValue(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="book-panel overflow-hidden">
                    <div className="border-b border-white/[0.07] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Source playback</div>
                    <pre className="max-h-80 overflow-auto bg-[#080d18] p-3 font-mono text-[11px] leading-6">
                      {lines.map((line, index) => {
                        const active = index + 1 === frame.line;
                        return (
                          <div key={index} className={`flex rounded-md px-2 ${active ? 'bg-emerald-300/12 text-emerald-100 ring-1 ring-emerald-300/20' : 'text-slate-500'}`}>
                            <span className={`mr-4 w-6 shrink-0 select-none text-right ${active ? 'text-emerald-300' : 'text-slate-700'}`}>{index + 1}</span>
                            <code>{line || ' '}</code>
                          </div>
                        );
                      })}
                    </pre>
                  </div>

                  <div className="space-y-5">
                    <div className="book-panel p-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Run budget</p>
                      <dl className="mt-3 space-y-2 text-[10px]">
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Operations</dt><dd className="font-mono text-slate-300">{result.metrics.operations}/{CODE_LIMITS.operations}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Loop iterations</dt><dd className="font-mono text-slate-300">{result.metrics.loopIterations}/{CODE_LIMITS.loopIterations}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Peak cells</dt><dd className="font-mono text-slate-300">{result.metrics.peakCells}/{CODE_LIMITS.totalCells}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Syntax nodes</dt><dd className="font-mono text-slate-300">{result.metrics.astNodes}/{CODE_LIMITS.astNodes}</dd></div>
                      </dl>
                    </div>
                    <div className="book-panel p-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Console</p>
                      <div className="mt-3 min-h-16 font-mono text-[10px] leading-5 text-slate-400">
                        {frame.output.length ? frame.output.map((line, index) => <p key={index}>&gt; {line}</p>) : <p className="text-slate-700">No output yet</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
