import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { useAlgorithmSound } from './hooks/useAlgorithmSound';

export type AlgorithmDemo =
  | 'binary-search'
  | 'ternary-search'
  | 'dutch-national-flag'
  | 'top-k-frequent'
  | 'queue-using-stacks'
  | 'stack-using-queues'
  | 'tower-of-hanoi'
  | 'rat-maze'
  | 'grid-search';

type StepEvent = 'compare' | 'swap' | 'visit' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'recurse' | 'found' | 'not-found' | 'complete';

interface DemoStep {
  description: string;
  event: StepEvent;
  values?: number[];
  highlights?: number[];
  pointers?: Record<string, number>;
  stacks?: Record<string, number[]>;
  queues?: Record<string, number[]>;
  pegs?: number[][];
  grid?: number[][];
  path?: number[];
  visited?: number[];
  meta?: string[];
}

const DEMO_INFO: Record<AlgorithmDemo, { title: string; subtitle: string; inputLabel: string; defaultInput: string; helper: string }> = {
  'binary-search': {
    title: 'Binary Search',
    subtitle: 'Search a sorted array in logarithmic time',
    inputLabel: 'Sorted numbers; target',
    defaultInput: '2,5,8,12,16,23,38,56,72;23',
    helper: 'Format: sorted comma-separated numbers; target',
  },
  'ternary-search': {
    title: 'Ternary Search',
    subtitle: 'Split a sorted search range into thirds',
    inputLabel: 'Sorted numbers; target',
    defaultInput: '1,4,8,11,15,19,23,27,31,35,39;31',
    helper: 'Format: sorted comma-separated numbers; target',
  },
  'dutch-national-flag': {
    title: 'Sort Colors',
    subtitle: 'Dutch national flag partitioning',
    inputLabel: 'Colors as 0, 1, 2',
    defaultInput: '2,0,2,1,1,0,2,0,1',
    helper: 'Use only 0, 1, and 2.',
  },
  'top-k-frequent': {
    title: 'Top K Frequent Elements',
    subtitle: 'Count, rank, and extract frequent values',
    inputLabel: 'Numbers; k',
    defaultInput: '1,1,1,2,2,3,3,3,3,4,5,5;3',
    helper: 'Format: comma-separated numbers; k',
  },
  'queue-using-stacks': {
    title: 'Queue Using Two Stacks',
    subtitle: 'Build FIFO behavior from LIFO stacks',
    inputLabel: 'Enqueue values',
    defaultInput: '10,20,30,40',
    helper: 'Values are enqueued, then all are dequeued.',
  },
  'stack-using-queues': {
    title: 'Stack Using Two Queues',
    subtitle: 'Build LIFO behavior from FIFO queues',
    inputLabel: 'Push values',
    defaultInput: '10,20,30,40',
    helper: 'Values are pushed, then all are popped.',
  },
  'tower-of-hanoi': {
    title: 'Tower of Hanoi',
    subtitle: 'Recursive disk movement',
    inputLabel: 'Disk count',
    defaultInput: '4',
    helper: 'Use 2 to 5 disks for readable playback.',
  },
  'rat-maze': {
    title: 'Rat in a Maze',
    subtitle: 'Recursive DFS and BFS on blocked cells',
    inputLabel: 'Mode',
    defaultInput: 'dfs',
    helper: 'Use dfs or bfs. The maze is generated in the visualizer.',
  },
  'grid-search': {
    title: 'Grid Search',
    subtitle: 'Search allowed positions from source to target',
    inputLabel: 'Mode',
    defaultInput: 'bfs',
    helper: 'Use bfs or dfs over free/occupied grid cells.',
  },
};

export default function AlgorithmPlaygroundPage({ demo }: { demo: AlgorithmDemo }) {
  const info = DEMO_INFO[demo];
  const [input, setInput] = useState(info.defaultInput);
  const [steps, setSteps] = useState<DemoStep[]>(() => buildSteps(demo, info.defaultInput));
  const [stepIndex, setStepIndex] = useState(0);
  const [animationDelay, setAnimationDelay] = useState(650);
  const { soundEnabled, toggleSound, playEvent } = useAlgorithmSound();
  const currentStep = steps[stepIndex] ?? steps[0];
  const progress = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  const run = () => {
    const next = buildSteps(demo, input);
    setSteps(next);
    setStepIndex(0);
    playEvent(next[0]?.event ?? 'visit', 0, next.length);
  };

  const randomize = () => {
    const nextInput = randomInput(demo);
    setInput(nextInput);
    const next = buildSteps(demo, nextInput);
    setSteps(next);
    setStepIndex(0);
  };

  const goToStep = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    setStepIndex(clamped);
    const step = steps[clamped];
    if (step) playEvent(step.event, clamped, steps.length);
  };

  const playAll = () => {
    for (let index = stepIndex; index < steps.length; index += 1) {
      window.setTimeout(() => {
        setStepIndex(index);
        const step = steps[index];
        if (step) playEvent(step.event, index, steps.length);
      }, (index - stepIndex) * animationDelay);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 xl:flex-row">
      <main className="order-last flex min-h-[520px] flex-1 flex-col gap-4 xl:order-first">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Algorithms</p>
          <h2 className="mt-1 text-xl font-bold text-white">{info.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{info.subtitle}</p>
        </section>
        <Visualizer step={currentStep} demo={demo} />
      </main>

      <aside className="w-full space-y-4 xl:w-80 xl:shrink-0">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Input</h3>
          <label className="text-[11px] text-slate-500">{info.inputLabel}</label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-xl bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-indigo-500/50"
          />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{info.helper}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={run} className="rounded-xl bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/40 hover:bg-indigo-500/30">
              Run
            </button>
            <button onClick={randomize} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
              <Shuffle size={13} /> Random
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step Playback</h3>
            <span className="font-mono text-xs text-indigo-300">{Math.min(stepIndex + 1, steps.length)} / {steps.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Animation Speed</span>
              <span className="font-mono text-[10px] text-indigo-300">{animationDelay}ms</span>
            </div>
            <input
              type="range"
              min={120}
              max={1200}
              step={40}
              value={animationDelay}
              onChange={(event) => setAnimationDelay(Number(event.target.value))}
              className="w-full accent-indigo-400"
              aria-label="Animation step delay"
            />
            <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-slate-600">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>
          <p className="mt-3 min-h-12 text-xs leading-relaxed text-slate-300">{currentStep?.description}</p>
          {currentStep?.meta && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentStep.meta.map((item) => (
                <span key={item} className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400">{item}</span>
              ))}
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={() => goToStep(stepIndex - 1)} disabled={stepIndex <= 0} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-2 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 disabled:opacity-30">
              <ChevronLeft size={13} /> Back
            </button>
            <button onClick={playAll} disabled={stepIndex >= steps.length - 1} className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-500/15 px-2 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30 disabled:opacity-30">
              <Play size={13} /> Play
            </button>
            <button onClick={() => goToStep(stepIndex + 1)} disabled={stepIndex >= steps.length - 1} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-2 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 disabled:opacity-30">
              Next <ChevronRight size={13} />
            </button>
          </div>
          <button onClick={() => goToStep(0)} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
            <RotateCcw size={13} /> Reset Steps
          </button>
        </section>

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
        </section>
      </aside>
    </div>
  );
}

function Visualizer({ step, demo }: { step?: DemoStep; demo: AlgorithmDemo }) {
  if (!step) return null;
  if (step.grid) return <GridView step={step} />;
  if (step.pegs) return <PegView pegs={step.pegs} />;
  if (step.stacks || step.queues) return <ContainerView step={step} />;
  return <ArrayView step={step} demo={demo} />;
}

function ArrayView({ step, demo }: { step: DemoStep; demo: AlgorithmDemo }) {
  const values = step.values ?? [];
  const highlights = new Set(step.highlights ?? []);
  const colorFor = (value: number, index: number) => {
    if (demo === 'dutch-national-flag') return value === 0 ? 'bg-sky-500/25 text-sky-200 ring-sky-500/40' : value === 1 ? 'bg-white/15 text-white ring-white/30' : 'bg-rose-500/25 text-rose-200 ring-rose-500/40';
    return highlights.has(index) ? 'bg-indigo-500/25 text-indigo-200 ring-indigo-500/50' : 'bg-slate-800/70 text-slate-200 ring-slate-700/50';
  };
  return (
    <section className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5">
      <div className="flex max-w-full flex-wrap items-end justify-center gap-2">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className={`relative flex h-16 min-w-12 items-center justify-center rounded-xl px-3 font-mono text-sm font-black ring-1 transition-all ${colorFor(value, index)}`}>
            {value}
            {Object.entries(step.pointers ?? {}).filter(([, pointerIndex]) => pointerIndex === index).map(([label]) => (
              <span key={label} className="absolute -bottom-5 text-[9px] uppercase tracking-wide text-amber-300">{label}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function ContainerView({ step }: { step: DemoStep }) {
  const groups = step.stacks ?? step.queues ?? {};
  return (
    <section className="grid flex-1 gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5 md:grid-cols-2">
      {Object.entries(groups).map(([name, values]) => (
        <div key={name} className="flex flex-col justify-end rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-700/50">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{name}</h3>
          <div className="flex min-h-64 flex-col-reverse gap-2">
            {values.map((value, index) => (
              <div key={`${name}-${value}-${index}`} className="rounded-lg bg-indigo-500/15 px-3 py-2 text-center font-mono text-sm font-bold text-indigo-200 ring-1 ring-indigo-500/30">
                {value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function PegView({ pegs }: { pegs: number[][] }) {
  return (
    <section className="grid flex-1 items-end gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5 md:grid-cols-3">
      {pegs.map((peg, pegIndex) => (
        <div key={pegIndex} className="relative flex h-72 flex-col-reverse items-center justify-start gap-1 rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-700/50">
          <div className="absolute bottom-4 h-56 w-2 rounded-full bg-slate-700" />
          {peg.map((disk) => (
            <div key={`${pegIndex}-${disk}`} className="z-10 h-6 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 ring-1 ring-cyan-300/40" style={{ width: `${disk * 34 + 34}px` }} />
          ))}
          <span className="absolute bottom-0 text-[10px] font-mono text-slate-500">Peg {pegIndex + 1}</span>
        </div>
      ))}
    </section>
  );
}

function GridView({ step }: { step: DemoStep }) {
  const visited = new Set(step.visited ?? []);
  const path = new Set(step.path ?? []);
  return (
    <section className="flex flex-1 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${step.grid?.[0]?.length ?? 0}, minmax(0, 1fr))` }}>
        {step.grid?.flatMap((row, rowIndex) => row.map((cell, colIndex) => {
          const idx = rowIndex * row.length + colIndex;
          const isPath = path.has(idx);
          const isVisited = visited.has(idx);
          const isSource = idx === 0;
          const isTarget = idx === row.length * (step.grid?.length ?? 1) - 1;
          const className = cell === 1
            ? 'bg-slate-800 ring-slate-700'
            : isPath
              ? 'bg-emerald-400 ring-emerald-200'
              : isSource
                ? 'bg-sky-400 ring-sky-200'
                : isTarget
                  ? 'bg-orange-400 ring-orange-200'
                  : isVisited
                    ? 'bg-indigo-500/70 ring-indigo-300'
                    : 'bg-slate-900 ring-slate-700';
          return <div key={idx} className={`h-9 w-9 rounded-md ring-1 ${className}`} />;
        }))}
      </div>
    </section>
  );
}

function buildSteps(demo: AlgorithmDemo, input: string): DemoStep[] {
  switch (demo) {
    case 'binary-search':
      return binarySteps(input);
    case 'ternary-search':
      return ternarySteps(input);
    case 'dutch-national-flag':
      return dnfSteps(input);
    case 'top-k-frequent':
      return topKSteps(input);
    case 'queue-using-stacks':
      return queueUsingStacksSteps(input);
    case 'stack-using-queues':
      return stackUsingQueuesSteps(input);
    case 'tower-of-hanoi':
      return hanoiSteps(input);
    case 'rat-maze':
      return mazeSteps(input, true);
    case 'grid-search':
      return mazeSteps(input, false);
    default:
      return [];
  }
}

function parseNumbers(raw: string) {
  return raw.split(',').map((item) => item.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
}

function parseNumberTarget(input: string) {
  const [arrayRaw, targetRaw] = input.split(';');
  return { values: parseNumbers(arrayRaw ?? '').sort((a, b) => a - b), target: Number(targetRaw) };
}

function binarySteps(input: string): DemoStep[] {
  const { values, target } = parseNumberTarget(input);
  const steps: DemoStep[] = [];
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ description: `Compare target ${target} with middle value ${values[mid]} at index ${mid}.`, event: 'compare', values, highlights: [mid], pointers: { low, mid, high } });
    if (values[mid] === target) {
      steps.push({ description: `Found ${target} at index ${mid}.`, event: 'found', values, highlights: [mid], pointers: { low, mid, high } });
      return steps;
    }
    if (values[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return [...steps, { description: `${target} is not present in the sorted array.`, event: 'not-found', values }];
}

function ternarySteps(input: string): DemoStep[] {
  const { values, target } = parseNumberTarget(input);
  const steps: DemoStep[] = [];
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const third = Math.floor((high - low) / 3);
    const mid1 = low + third;
    const mid2 = high - third;
    steps.push({ description: `Compare ${target} with midpoints ${values[mid1]} and ${values[mid2]}.`, event: 'compare', values, highlights: [mid1, mid2], pointers: { low, mid1, mid2, high } });
    if (values[mid1] === target) return [...steps, { description: `Found ${target} at first midpoint ${mid1}.`, event: 'found', values, highlights: [mid1] }];
    if (values[mid2] === target) return [...steps, { description: `Found ${target} at second midpoint ${mid2}.`, event: 'found', values, highlights: [mid2] }];
    if (target < values[mid1]) high = mid1 - 1;
    else if (target > values[mid2]) low = mid2 + 1;
    else {
      low = mid1 + 1;
      high = mid2 - 1;
    }
  }
  return [...steps, { description: `${target} is not present in the sorted array.`, event: 'not-found', values }];
}

function dnfSteps(input: string): DemoStep[] {
  const values = parseNumbers(input).filter((value) => value === 0 || value === 1 || value === 2);
  const arr = [...values];
  const steps: DemoStep[] = [{ description: 'Start with low, mid, and high pointers.', event: 'visit', values: [...arr], pointers: { low: 0, mid: 0, high: arr.length - 1 } }];
  let low = 0;
  let mid = 0;
  let high = arr.length - 1;
  while (mid <= high) {
    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      steps.push({ description: `Swap 0 at mid ${mid} with low ${low}.`, event: 'swap', values: [...arr], highlights: [low, mid], pointers: { low, mid, high } });
      low += 1;
      mid += 1;
    } else if (arr[mid] === 1) {
      steps.push({ description: `Value 1 at mid ${mid} is already in the middle partition.`, event: 'compare', values: [...arr], highlights: [mid], pointers: { low, mid, high } });
      mid += 1;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      steps.push({ description: `Swap 2 at mid ${mid} with high ${high}.`, event: 'swap', values: [...arr], highlights: [mid, high], pointers: { low, mid, high } });
      high -= 1;
    }
  }
  return [...steps, { description: 'Colors are sorted: all 0s, then 1s, then 2s.', event: 'complete', values: [...arr] }];
}

function topKSteps(input: string): DemoStep[] {
  const [arrayRaw, kRaw] = input.split(';');
  const values = parseNumbers(arrayRaw ?? '');
  const k = Math.max(1, Number(kRaw) || 3);
  const counts = new Map<number, number>();
  const steps: DemoStep[] = [];
  values.forEach((value, index) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    steps.push({ description: `Count ${value}: frequency is now ${counts.get(value)}.`, event: 'visit', values, highlights: [index], meta: [...counts.entries()].map(([n, c]) => `${n}:${c}`) });
  });
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
  return [...steps, { description: `Top ${k} frequent elements: ${ranked.slice(0, k).join(', ')}.`, event: 'complete', values: ranked, highlights: ranked.slice(0, k).map((_, i) => i), meta: [...counts.entries()].map(([n, c]) => `${n}:${c}`) }];
}

function queueUsingStacksSteps(input: string): DemoStep[] {
  const values = parseNumbers(input);
  const inputStack: number[] = [];
  const outputStack: number[] = [];
  const steps: DemoStep[] = [];
  values.forEach((value) => {
    inputStack.push(value);
    steps.push({ description: `Enqueue ${value}: push onto input stack.`, event: 'push', stacks: { input: [...inputStack], output: [...outputStack] } });
  });
  while (inputStack.length > 0) {
    const value = inputStack.pop() as number;
    outputStack.push(value);
    steps.push({ description: `Move ${value} from input to output stack to expose queue front.`, event: 'pop', stacks: { input: [...inputStack], output: [...outputStack] } });
  }
  while (outputStack.length > 0) {
    const value = outputStack.pop() as number;
    steps.push({ description: `Dequeue ${value} from output stack.`, event: 'dequeue', stacks: { input: [...inputStack], output: [...outputStack] } });
  }
  return steps;
}

function stackUsingQueuesSteps(input: string): DemoStep[] {
  const values = parseNumbers(input);
  let q1: number[] = [];
  let q2: number[] = [];
  const steps: DemoStep[] = [];
  values.forEach((value) => {
    q2.push(value);
    steps.push({ description: `Push ${value}: enqueue into helper queue.`, event: 'enqueue', queues: { primary: [...q1], helper: [...q2] } });
    while (q1.length > 0) q2.push(q1.shift() as number);
    [q1, q2] = [q2, []];
    steps.push({ description: `Rotate queues so ${value} becomes the next pop.`, event: 'visit', queues: { primary: [...q1], helper: [...q2] } });
  });
  while (q1.length > 0) {
    const value = q1.shift() as number;
    steps.push({ description: `Pop ${value} from primary queue front.`, event: 'dequeue', queues: { primary: [...q1], helper: [...q2] } });
  }
  return steps;
}

function hanoiSteps(input: string): DemoStep[] {
  const diskCount = Math.max(2, Math.min(5, Number(input) || 4));
  const pegs = [Array.from({ length: diskCount }, (_, i) => diskCount - i), [], []] as number[][];
  const steps: DemoStep[] = [{ description: `Start with ${diskCount} disks on peg 1.`, event: 'recurse', pegs: clonePegs(pegs) }];
  const move = (n: number, from: number, to: number, aux: number) => {
    if (n === 0) return;
    steps.push({ description: `Solve subproblem: move ${n - 1} disk(s) from peg ${from + 1} to peg ${aux + 1}.`, event: 'recurse', pegs: clonePegs(pegs) });
    move(n - 1, from, aux, to);
    const disk = pegs[from].pop();
    if (disk) pegs[to].push(disk);
    steps.push({ description: `Move disk ${disk} from peg ${from + 1} to peg ${to + 1}.`, event: 'visit', pegs: clonePegs(pegs) });
    move(n - 1, aux, to, from);
  };
  move(diskCount, 0, 2, 1);
  return [...steps, { description: 'Tower complete.', event: 'complete', pegs: clonePegs(pegs) }];
}

function clonePegs(pegs: number[][]) {
  return pegs.map((peg) => [...peg]);
}

const DEFAULT_GRID = [
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0],
];

function mazeSteps(input: string, ratMaze: boolean): DemoStep[] {
  const mode = input.trim().toLowerCase() === 'dfs' ? 'dfs' : 'bfs';
  const grid = DEFAULT_GRID.map((row) => [...row]);
  const cols = grid[0].length;
  const target = grid.length * cols - 1;
  const visited = new Set<number>();
  const parent = new Map<number, number>();
  const steps: DemoStep[] = [];
  const frontier = [0];
  visited.add(0);
  while (frontier.length > 0) {
    const current = mode === 'dfs' ? frontier.pop() as number : frontier.shift() as number;
    steps.push({ description: `${ratMaze ? 'Rat maze' : 'Grid search'} ${mode.toUpperCase()}: visit cell (${Math.floor(current / cols)}, ${current % cols}).`, event: mode === 'dfs' ? 'recurse' : 'visit', grid, visited: [...visited], path: [current] });
    if (current === target) break;
    for (const next of neighbors(current, grid)) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, current);
      frontier.push(next);
      steps.push({ description: `Add allowed neighbor (${Math.floor(next / cols)}, ${next % cols}) to ${mode === 'dfs' ? 'stack' : 'queue'}.`, event: mode === 'dfs' ? 'push' : 'enqueue', grid, visited: [...visited], path: [next] });
    }
  }
  const path: number[] = [];
  let cur = target;
  while (cur !== undefined && (cur === 0 || parent.has(cur))) {
    path.unshift(cur);
    if (cur === 0) break;
    cur = parent.get(cur) as number;
  }
  return [...steps, { description: path[0] === 0 ? `Found path with ${path.length} cells.` : 'No path found.', event: path[0] === 0 ? 'found' : 'not-found', grid, visited: [...visited], path }];
}

function neighbors(index: number, grid: number[][]) {
  const cols = grid[0].length;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    .filter(([r, c]) => r >= 0 && c >= 0 && r < grid.length && c < cols && grid[r][c] === 0)
    .map(([r, c]) => r * cols + c);
}

function randomInput(demo: AlgorithmDemo) {
  const values = Array.from({ length: 9 }, () => Math.floor(Math.random() * 40) + 1);
  switch (demo) {
    case 'binary-search':
    case 'ternary-search': {
      const sorted = [...values].sort((a, b) => a - b);
      const middleIndex = Math.floor(sorted.length / 2);
      let targetIndex = Math.floor(Math.random() * sorted.length);
      if (demo === 'binary-search' && sorted.length > 1 && targetIndex === middleIndex) {
        targetIndex = (targetIndex + 1) % sorted.length;
      }
      return `${sorted.join(',')};${sorted[targetIndex]}`;
    }
    case 'dutch-national-flag':
      return Array.from({ length: 10 }, () => Math.floor(Math.random() * 3)).join(',');
    case 'top-k-frequent':
      return `${Array.from({ length: 12 }, () => Math.floor(Math.random() * 5) + 1).join(',')};3`;
    case 'tower-of-hanoi':
      return String(Math.floor(Math.random() * 3) + 3);
    case 'rat-maze':
      return Math.random() > 0.5 ? 'dfs' : 'bfs';
    case 'grid-search':
      return Math.random() > 0.5 ? 'dfs' : 'bfs';
    default:
      return values.slice(0, 4).join(',');
  }
}

