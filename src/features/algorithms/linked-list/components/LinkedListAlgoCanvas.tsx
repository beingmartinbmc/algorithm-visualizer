import type { LLColor, LLStep } from '../types/linkedListAlgo';

interface Props {
  step: LLStep | null;
}

const COLORS: Record<LLColor, { border: string; bg: string; text: string }> = {
  green: { border: '#34d399', bg: 'rgba(52,211,153,0.18)', text: '#6ee7b7' },
  red: { border: '#f87171', bg: 'rgba(248,113,113,0.18)', text: '#fca5a5' },
  yellow: { border: '#fbbf24', bg: 'rgba(251,191,36,0.18)', text: '#fde68a' },
  blue: { border: '#60a5fa', bg: 'rgba(96,165,250,0.18)', text: '#93c5fd' },
  purple: { border: '#c084fc', bg: 'rgba(192,132,252,0.18)', text: '#d8b4fe' },
};
const DEFAULT_NODE = { border: '#475569', bg: 'rgba(30,41,59,0.7)', text: '#cbd5e1' };
const POINTER_COLOR: Record<LLColor, string> = {
  green: '#34d399', red: '#f87171', yellow: '#fbbf24', blue: '#60a5fa', purple: '#c084fc',
};

const NODE_W = 60;
const NODE_H = 48;
const GAP = 40;
const STEP = NODE_W + GAP;
const PER_ROW = 6;
const ROW_H = NODE_H + 78; // room for pointer labels above + wrap arrows below

export default function LinkedListAlgoCanvas({ step }: Props) {
  if (!step) return null;
  if (step.lru) return <LRUView step={step} />;
  return <ListView step={step} />;
}

function ListView({ step }: { step: LLStep }) {
  const { nodes, pointers, highlights, cycleTo } = step;
  const highlightMap = new Map(highlights.map((h) => [h.index, h.color]));
  // Group pointers that share an index so labels stack instead of overlapping.
  const pointersByIndex = new Map<number, typeof pointers>();
  for (const p of pointers) {
    const arr = pointersByIndex.get(p.index) ?? [];
    arr.push(p);
    pointersByIndex.set(p.index, arr);
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center">
        <div className="flex h-16 w-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 text-xs text-slate-600">
          Empty list — null
        </div>
      </div>
    );
  }

  const rows = Math.ceil(nodes.length / PER_ROW);
  const cols = Math.min(nodes.length, PER_ROW);
  const width = cols * STEP + GAP;
  const height = rows * ROW_H + 20;
  const pad = 28; // top padding for pointer labels

  const pos = (idx: number) => {
    const r = Math.floor(idx / PER_ROW);
    const c = idx % PER_ROW;
    return { x: c * STEP + GAP, y: r * ROW_H + pad };
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-auto px-2">
      <svg viewBox={`0 0 ${width + 20} ${height}`} width="100%" style={{ maxWidth: `${width + 20}px`, overflow: 'visible' }}>
        {/* edges */}
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;
          const { x, y } = pos(idx);
          const sameRow = idx % PER_ROW !== PER_ROW - 1;
          if (isLast) {
            // tail → null or cycle handled separately
            return null;
          }
          if (sameRow) {
            return (
              <g key={`edge-${node.id}`}>
                <line x1={x + NODE_W} y1={y + NODE_H / 2} x2={x + STEP} y2={y + NODE_H / 2} stroke="#475569" strokeWidth={1.6} />
                <polygon points={`${x + STEP},${y + NODE_H / 2} ${x + STEP - 7},${y + NODE_H / 2 - 4} ${x + STEP - 7},${y + NODE_H / 2 + 4}`} fill="#475569" />
              </g>
            );
          }
          // wrap arrow to next row, first column
          const nxt = pos(idx + 1);
          return (
            <path
              key={`wrap-${node.id}`}
              d={`M ${x + NODE_W} ${y + NODE_H / 2} L ${x + NODE_W + 14} ${y + NODE_H / 2} L ${x + NODE_W + 14} ${y + NODE_H + 28} L ${nxt.x - 14} ${nxt.y + NODE_H / 2} L ${nxt.x} ${nxt.y + NODE_H / 2}`}
              fill="none" stroke="#475569" strokeWidth={1.6} markerEnd=""
            />
          );
        })}

        {/* tail → null (acyclic) */}
        {cycleTo == null && nodes.length > 0 && (() => {
          const idx = nodes.length - 1;
          const { x, y } = pos(idx);
          return (
            <text key="null" x={x + NODE_W + 22} y={y + NODE_H / 2 + 4} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">null</text>
          );
        })()}

        {/* cycle arrow: tail → cycleTo */}
        {cycleTo != null && nodes.length > 0 && (() => {
          const tail = pos(nodes.length - 1);
          const target = pos(cycleTo);
          const startX = tail.x + NODE_W / 2;
          const startY = tail.y + NODE_H;
          const endX = target.x + NODE_W / 2;
          const endY = target.y + NODE_H;
          const dip = Math.max(startY, endY) + 46;
          return (
            <g>
              <path d={`M ${startX} ${startY} C ${startX} ${dip}, ${endX} ${dip}, ${endX} ${endY}`} fill="none" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="5 4" />
              <polygon points={`${endX},${endY} ${endX - 4},${endY + 8} ${endX + 4},${endY + 8}`} fill="#f59e0b" />
              <text x={(startX + endX) / 2} y={dip + 12} textAnchor="middle" fontSize="9" fill="#fbbf24" fontFamily="monospace">cycle → index {cycleTo}</text>
            </g>
          );
        })()}

        {/* nodes */}
        {nodes.map((node, idx) => {
          const { x, y } = pos(idx);
          const color = highlightMap.get(idx);
          const c = color ? COLORS[color] : DEFAULT_NODE;
          const ptrs = pointersByIndex.get(idx) ?? [];
          return (
            <g key={node.id}>
              {idx === 0 && (
                <text x={x + NODE_W / 2} y={y - 16} textAnchor="middle" fontSize="9" fill="#818cf8" fontFamily="monospace">head</text>
              )}
              {/* pointer labels stacked above the node */}
              {ptrs.map((p, i) => (
                <g key={p.name}>
                  <text x={x + NODE_W / 2} y={y - 6 - i * 11} textAnchor="middle" fontSize="9" fontWeight="bold" fill={POINTER_COLOR[p.color ?? 'blue']} fontFamily="monospace">
                    {p.name}↓
                  </text>
                </g>
              ))}
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} fill={c.bg} stroke={c.border} strokeWidth={color ? 2.2 : 1.5} />
              <text x={x + NODE_W / 2} y={y + NODE_H / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill={c.text} fontFamily="sans-serif">
                {node.value}
              </text>
              <text x={x + NODE_W / 2} y={y + NODE_H + 12} textAnchor="middle" fontSize="8" fill="#475569" fontFamily="monospace">[{idx}]</text>
            </g>
          );
        })}
      </svg>

      {step.description && (
        <div className="w-full max-w-xl rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs leading-relaxed text-indigo-300">
          {step.description}
        </div>
      )}
      {step.meta && step.meta.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {step.meta.map((m) => (
            <span key={m} className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-slate-300 ring-1 ring-slate-700/50">{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function LRUView({ step }: { step: LLStep }) {
  const lru = step.lru!;
  const slots = Array.from({ length: lru.capacity });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 overflow-auto px-2">
      <div className="flex w-full max-w-2xl items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
        <span className="text-emerald-400">← Most recently used</span>
        <span className="text-rose-400">Least recently used →</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {slots.map((_, i) => {
          const entry = lru.entries[i];
          if (!entry) {
            return (
              <div key={`empty-${i}`} className="flex h-20 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 text-[10px] text-slate-600">
                empty
              </div>
            );
          }
          const isHit = lru.hitKey === entry.key;
          const isEvict = lru.evictKey === entry.key;
          const tone = isEvict
            ? 'border-rose-400 bg-rose-500/15'
            : isHit
              ? 'border-emerald-400 bg-emerald-500/15'
              : 'border-slate-600 bg-slate-800/70';
          return (
            <div key={entry.key} className={`flex h-20 w-24 flex-col items-center justify-center rounded-xl border-2 ${tone} transition-all`}>
              <span className="text-[9px] font-mono uppercase tracking-wide text-slate-400">key {entry.key}</span>
              <span className="mt-0.5 text-xl font-bold text-white">{entry.value}</span>
              {i === 0 && <span className="mt-0.5 text-[8px] font-mono text-emerald-400">MRU</span>}
              {i === lru.entries.length - 1 && lru.entries.length === lru.capacity && i !== 0 && (
                <span className="mt-0.5 text-[8px] font-mono text-rose-400">LRU</span>
              )}
            </div>
          );
        })}
      </div>

      {(lru.missKey != null) && (
        <div className="rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-mono text-rose-300 ring-1 ring-rose-500/30">
          MISS · key {lru.missKey} not present
        </div>
      )}

      {step.description && (
        <div className="w-full max-w-xl rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs leading-relaxed text-indigo-300">
          {step.description}
        </div>
      )}
      {step.meta && step.meta.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {step.meta.map((m) => (
            <span key={m} className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-slate-300 ring-1 ring-slate-700/50">{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}
