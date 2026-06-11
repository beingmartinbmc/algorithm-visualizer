import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { useDSSound } from '../hooks/useDSSound';

export type AdvancedStructure = 'trie' | 'segment-tree' | 'fenwick-tree';

interface StructureStep {
  description: string;
  event: 'insert' | 'delete' | 'access' | 'traverse' | 'found' | 'not-found';
  nodes?: TreeNodeView[];
  array?: number[];
  highlights?: number[];
  queryRange?: [number, number];
  meta?: string[];
}

interface TreeNodeView {
  id: string;
  label: string;
  value?: number;
  x: number;
  y: number;
  parentId?: string;
}

const INFO: Record<AdvancedStructure, { title: string; subtitle: string; inputLabel: string; defaultInput: string; helper: string }> = {
  trie: {
    title: 'Trie',
    subtitle: 'Prefix tree for words',
    inputLabel: 'Words; operation; query',
    defaultInput: 'cat,car,cart,dog,dove;prefix;ca',
    helper: 'Format: words; insert/delete/search/prefix; query',
  },
  'segment-tree': {
    title: 'Segment Tree',
    subtitle: 'Range query and point update',
    inputLabel: 'Array; operation; args',
    defaultInput: '2,1,5,3,4,8;query;1,4',
    helper: 'Operations: build, query;l,r, update;index,value',
  },
  'fenwick-tree': {
    title: 'Fenwick Tree',
    subtitle: 'Binary indexed tree',
    inputLabel: 'Array; operation; args',
    defaultInput: '2,1,5,3,4,8;range;1,4',
    helper: 'Operations use 1-based indexes: build, prefix;i, range;l,r, update;index,value',
  },
};

export default function AdvancedStructurePage({ structure }: { structure: AdvancedStructure }) {
  const info = INFO[structure];
  const [input, setInput] = useState(info.defaultInput);
  const [steps, setSteps] = useState<StructureStep[]>(() => buildStructureSteps(structure, info.defaultInput));
  const [stepIndex, setStepIndex] = useState(0);
  const [animationDelay, setAnimationDelay] = useState(650);
  const { soundEnabled, toggleSound, playInsert, playDelete, playAccess, playTraverse, playFound, playNotFound } = useDSSound();
  const currentStep = steps[stepIndex] ?? steps[0];

  const playStepSound = (step: StructureStep, index: number) => {
    if (step.event === 'insert') playInsert();
    else if (step.event === 'delete') playDelete();
    else if (step.event === 'access') playAccess();
    else if (step.event === 'traverse') playTraverse(index, steps.length);
    else if (step.event === 'found') playFound();
    else playNotFound();
  };

  const run = () => {
    const next = buildStructureSteps(structure, input);
    setSteps(next);
    setStepIndex(0);
    if (next[0]) playStepSound(next[0], 0);
  };

  const goToStep = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    setStepIndex(clamped);
    const step = steps[clamped];
    if (step) playStepSound(step, clamped);
  };

  const randomize = () => {
    const nextInput = randomStructureInput(structure);
    setInput(nextInput);
    const next = buildStructureSteps(structure, nextInput);
    setSteps(next);
    setStepIndex(0);
  };

  const playAll = () => {
    for (let index = stepIndex; index < steps.length; index += 1) {
      window.setTimeout(() => {
        setStepIndex(index);
        const step = steps[index];
        if (step) playStepSound(step, index);
      }, (index - stepIndex) * animationDelay);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 xl:flex-row">
      <main className="order-last flex min-h-[520px] flex-1 flex-col gap-4 xl:order-first">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-300">Data Structures</p>
          <h2 className="mt-1 text-xl font-bold text-white">{info.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{info.subtitle}</p>
        </section>
        <section className="flex flex-1 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/60 p-5">
          {currentStep?.nodes ? <TreeView step={currentStep} /> : <ArrayStructureView step={currentStep} structure={structure} />}
        </section>
      </main>

      <aside className="w-full space-y-4 xl:w-80 xl:shrink-0">
        <Panel title="Operation">
          <label className="text-[11px] text-slate-500">{info.inputLabel}</label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-xl bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-rose-500/50"
          />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{info.helper}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={run} className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/30">
              Run
            </button>
            <button onClick={randomize} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
              <Shuffle size={13} /> Random
            </button>
          </div>
        </Panel>

        <Panel title="Step Playback">
          <p className="min-h-12 text-xs leading-relaxed text-slate-300">{currentStep?.description}</p>
          {currentStep?.meta && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentStep.meta.map((item) => <span key={item} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">{item}</span>)}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Step</span>
            <span className="font-mono text-rose-300">{Math.min(stepIndex + 1, steps.length)} / {steps.length}</span>
          </div>
          <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Animation Speed</span>
              <span className="font-mono text-[10px] text-rose-300">{animationDelay}ms</span>
            </div>
            {/* slider is reversed so dragging right = faster */}
            <input
              type="range"
              min={120}
              max={1200}
              step={40}
              value={1320 - animationDelay}
              onChange={(event) => setAnimationDelay(1320 - Number(event.target.value))}
              className="w-full accent-rose-400"
              aria-label="Animation speed"
            />
            <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-slate-600">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
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
        </Panel>

        <Panel title="Audio">
          <button
            onClick={() => toggleSound(!soundEnabled)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${
              soundEnabled ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30' : 'bg-slate-800/70 text-slate-400 ring-slate-700/40'
            }`}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
        </Panel>
      </aside>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

function TreeView({ step }: { step: StructureStep }) {
  const nodes = step.nodes ?? [];
  const highlights = new Set(step.highlights ?? []);
  return (
    <svg viewBox="0 0 720 380" className="h-full min-h-[420px] w-full">
      {nodes.map((node) => {
        const parent = nodes.find((item) => item.id === node.parentId);
        if (!parent) return null;
        return <line key={`${parent.id}-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} stroke="#475569" strokeWidth={1.5} />;
      })}
      {nodes.map((node) => {
        const active = highlights.has(Number(node.id.replace(/\D/g, ''))) || highlights.has(nodes.indexOf(node));
        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={22} fill={active ? 'rgba(244,63,94,0.22)' : 'rgba(30,41,59,0.9)'} stroke={active ? '#fb7185' : '#64748b'} strokeWidth={2} />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={active ? '#fecdd3' : '#cbd5e1'}>{node.label}</text>
            {node.value !== undefined && <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="10" fill="#94a3b8">{node.value}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function ArrayStructureView({ step, structure }: { step?: StructureStep; structure: AdvancedStructure }) {
  const values = step?.array ?? [];
  const highlights = new Set(step?.highlights ?? []);
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-center gap-2">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className={`relative flex h-14 min-w-14 items-center justify-center rounded-xl px-3 font-mono text-sm font-black ring-1 ${
            highlights.has(index) ? 'bg-rose-500/20 text-rose-200 ring-rose-500/50' : 'bg-slate-800/70 text-slate-200 ring-slate-700/50'
          }`}>
            {value}
            <span className="absolute -bottom-5 text-[9px] text-slate-500">{structure === 'fenwick-tree' ? index + 1 : index}</span>
          </div>
        ))}
      </div>
      {step?.queryRange && (
        <p className="text-center text-xs text-slate-400">
          Active range: [{step.queryRange[0]}, {step.queryRange[1]}]
        </p>
      )}
    </div>
  );
}

function buildStructureSteps(structure: AdvancedStructure, input: string): StructureStep[] {
  if (structure === 'trie') return trieSteps(input);
  if (structure === 'segment-tree') return segmentSteps(input);
  return fenwickSteps(input);
}

function parseNumbers(raw: string) {
  return raw.split(',').map((item) => item.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
}

function trieSteps(input: string): StructureStep[] {
  const [wordsRaw = '', opRaw = 'prefix', queryRaw = ''] = input.split(';');
  const words = wordsRaw.split(',').map((word) => word.trim().toLowerCase()).filter(Boolean);
  const op = opRaw.trim().toLowerCase();
  const query = queryRaw.trim().toLowerCase();
  const steps: StructureStep[] = [];
  trieOrder = 0;
  const root = makeTrieNode('*');
  const wordList = op === 'insert' && query ? [...words, query] : words.filter((word) => !(op === 'delete' && word === query));
  words.forEach((word) => insertTrie(root, word));
  steps.push({ description: `Build trie from ${words.length} word(s).`, event: 'insert', nodes: layoutTrieView(root), meta: words });

  if (op === 'insert' && query) {
    insertTrie(root, query);
    steps.push({ description: `Insert "${query}" character by character.`, event: 'insert', nodes: layoutTrieView(root), meta: wordList });
  } else if (op === 'delete' && query) {
    const rebuilt = makeTrieNode('*');
    wordList.forEach((word) => insertTrie(rebuilt, word));
    steps.push({ description: `Delete "${query}" and rebuild active prefixes.`, event: 'delete', nodes: layoutTrieView(rebuilt), meta: wordList });
  } else {
    let node: TrieBuildNode | undefined = root;
    const highlights: number[] = [0];
    for (const char of query) {
      node = node.children.get(char);
      if (!node) {
        steps.push({ description: `Character "${char}" is missing, so "${query}" was not found.`, event: 'not-found', nodes: layoutTrieView(root), highlights, meta: words });
        return steps;
      }
      highlights.push(node.order);
      steps.push({ description: `Traverse character "${char}" in "${query}".`, event: 'traverse', nodes: layoutTrieView(root), highlights: [...highlights], meta: words });
    }
    const matches = words.filter((word) => op === 'search' ? word === query : word.startsWith(query));
    steps.push({ description: matches.length ? `Matched: ${matches.join(', ')}.` : `No match for "${query}".`, event: matches.length ? 'found' : 'not-found', nodes: layoutTrieView(root), highlights, meta: matches });
  }
  return steps;
}

interface TrieBuildNode {
  label: string;
  order: number;
  terminal: boolean;
  children: Map<string, TrieBuildNode>;
}

let trieOrder = 0;
function makeTrieNode(label: string): TrieBuildNode {
  return { label, order: trieOrder++, terminal: false, children: new Map() };
}

function insertTrie(root: TrieBuildNode, word: string) {
  let node = root;
  for (const char of word) {
    if (!node.children.has(char)) node.children.set(char, makeTrieNode(char));
    node = node.children.get(char) as TrieBuildNode;
  }
  node.terminal = true;
}

function layoutTrieView(root: TrieBuildNode): TreeNodeView[] {
  const nodes: TreeNodeView[] = [];
  const levels = new Map<number, TrieBuildNode[]>();
  const walk = (node: TrieBuildNode, depth: number, parentId?: string) => {
    const level = levels.get(depth) ?? [];
    level.push(node);
    levels.set(depth, level);
    nodes.push({ id: `trie-${node.order}`, label: node.terminal ? `${node.label}*` : node.label, x: 0, y: depth * 72 + 42, parentId });
    [...node.children.values()].forEach((child) => walk(child, depth + 1, `trie-${node.order}`));
  };
  walk(root, 0);
  nodes.forEach((node) => {
    const depth = Math.round((node.y - 42) / 72);
    const levelNodes = nodes.filter((item) => Math.round((item.y - 42) / 72) === depth);
    const index = levelNodes.indexOf(node);
    node.x = 360 + (index - (levelNodes.length - 1) / 2) * Math.max(46, 520 / Math.max(levelNodes.length, 1));
  });
  return nodes;
}

function segmentSteps(input: string): StructureStep[] {
  const [arrayRaw = '', opRaw = 'query', argsRaw = '0,0'] = input.split(';');
  const arr = parseNumbers(arrayRaw);
  const op = opRaw.trim();
  const args = parseNumbers(argsRaw);
  const tree = Array(arr.length * 4).fill(0);
  const steps: StructureStep[] = [];
  const build = (node: number, l: number, r: number) => {
    if (l === r) tree[node] = arr[l];
    else {
      const mid = Math.floor((l + r) / 2);
      build(node * 2, l, mid);
      build(node * 2 + 1, mid + 1, r);
      tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
    steps.push({ description: `Build segment [${l}, ${r}] with sum ${tree[node]}.`, event: 'insert', array: [...arr], highlights: range(l, r), queryRange: [l, r], meta: [`node:${node}`, `sum:${tree[node]}`] });
  };
  if (arr.length) build(1, 0, arr.length - 1);
  if (op === 'query') {
    const [rawQl, rawQr] = args;
    const ql = Math.max(0, Math.min(arr.length - 1, rawQl ?? 0));
    const qr = Math.max(ql, Math.min(arr.length - 1, rawQr ?? arr.length - 1));
    const query = (node: number, l: number, r: number): number => {
      steps.push({ description: `Visit segment [${l}, ${r}] for query [${ql}, ${qr}].`, event: 'traverse', array: [...arr], highlights: range(Math.max(l, ql), Math.min(r, qr)), queryRange: [ql, qr], meta: [`node:${node}`] });
      if (qr < l || r < ql) return 0;
      if (ql <= l && r <= qr) return tree[node];
      const mid = Math.floor((l + r) / 2);
      return query(node * 2, l, mid) + query(node * 2 + 1, mid + 1, r);
    };
    const sum = arr.length ? query(1, 0, arr.length - 1) : 0;
    steps.push({ description: `Range sum [${ql}, ${qr}] = ${sum}.`, event: 'found', array: [...arr], highlights: range(ql, qr), queryRange: [ql, qr], meta: [`sum:${sum}`] });
  } else if (op === 'update') {
    const [idx, value] = args;
    if (idx >= 0 && idx < arr.length) arr[idx] = value;
    steps.push({ description: `Point update index ${idx} to ${value}; ancestor sums update along the path.`, event: 'access', array: [...arr], highlights: [idx], meta: [`index:${idx}`, `value:${value}`] });
  }
  return steps;
}

function fenwickSteps(input: string): StructureStep[] {
  const [arrayRaw = '', opRaw = 'range', argsRaw = '1,1'] = input.split(';');
  const arr = parseNumbers(arrayRaw);
  const bit = Array(arr.length + 1).fill(0);
  const steps: StructureStep[] = [];
  const add = (index: number, delta: number) => {
    for (let i = index + 1; i <= arr.length; i += i & -i) {
      bit[i] += delta;
      steps.push({ description: `Update BIT[${i}] += ${delta}; next index is i + lowbit(i).`, event: 'insert', array: bit.slice(1), highlights: [i - 1], meta: [`lowbit:${i & -i}`] });
    }
  };
  arr.forEach((value, index) => add(index, value));
  const prefix = (index: number) => {
    let sum = 0;
    for (let i = index + 1; i > 0; i -= i & -i) {
      sum += bit[i];
      steps.push({ description: `Read BIT[${i}] while computing prefix(${index}); next index is i - lowbit(i).`, event: 'traverse', array: bit.slice(1), highlights: [i - 1], meta: [`partial:${sum}`, `lowbit:${i & -i}`] });
    }
    return sum;
  };
  const op = opRaw.trim();
  const args = parseNumbers(argsRaw);
  if (op === 'prefix') {
    const index = Math.max(0, Math.min(arr.length - 1, (args[0] ?? 1) - 1));
    const sum = prefix(index);
    steps.push({ description: `Prefix sum up to position ${index + 1} = ${sum}.`, event: 'found', array: bit.slice(1), highlights: [index], meta: [`sum:${sum}`] });
  } else if (op === 'update') {
    const idx = Math.max(0, Math.min(arr.length - 1, (args[0] ?? 1) - 1));
    const value = args[1] ?? arr[idx] ?? 0;
    if (idx >= 0 && idx < arr.length) add(idx, value - arr[idx]);
  } else {
    const l = Math.max(0, Math.min(arr.length - 1, (args[0] ?? 1) - 1));
    const r = Math.max(l, Math.min(arr.length - 1, (args[1] ?? arr.length) - 1));
    const sum = prefix(r) - (l > 0 ? prefix(l - 1) : 0);
    steps.push({ description: `Range sum positions [${l + 1}, ${r + 1}] = ${sum}.`, event: 'found', array: bit.slice(1), highlights: range(l, r), queryRange: [l + 1, r + 1], meta: [`sum:${sum}`] });
  }
  return steps;
}

function range(start: number, end: number) {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function randomStructureInput(structure: AdvancedStructure) {
  if (structure === 'trie') return 'tree,trie,trial,algo,all,also;prefix;tr';
  const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1).join(',');
  return structure === 'segment-tree' ? `${nums};query;1,4` : `${nums};range;1,4`;
}
