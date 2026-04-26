import { useMemo } from 'react';
import type { GameGraph, DijkstraStep } from '../types/dijkstra';

interface GraphCanvasProps {
  graph: GameGraph;
  startNode: string | null;
  endNode: string | null;
  playerPath: string[];
  optimalPath: string[];
  showOptimal: boolean;
  currentAlgoStep: DijkstraStep | null;
  selectingPhase: 'start' | 'end' | 'path';
  onClickNode: (id: string) => void;
}

const NODE_R = 20;
const DISTRICT_COLORS = ['#1e293b', '#0f3b3f', '#312e81', '#3b2416', '#064e3b'];

export default function GraphCanvas({
  graph,
  startNode,
  endNode,
  playerPath,
  optimalPath,
  showOptimal,
  currentAlgoStep,
  selectingPhase,
  onClickNode,
}: GraphCanvasProps) {
  const playerEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < playerPath.length - 1; i++) {
      set.add([playerPath[i], playerPath[i + 1]].sort().join('-'));
    }
    return set;
  }, [playerPath]);

  const optimalEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (showOptimal) {
      for (let i = 0; i < optimalPath.length - 1; i++) {
        set.add([optimalPath[i], optimalPath[i + 1]].sort().join('-'));
      }
    }
    return set;
  }, [optimalPath, showOptimal]);

  const algoVisited = currentAlgoStep?.visited ?? [];
  const algoCurrentId = currentAlgoStep?.currentNodeId ?? null;
  const relaxedEdge = currentAlgoStep?.relaxedEdge ?? null;

  function getNodeColor(id: string): string {
    if (id === startNode) return '#facc15';
    if (id === endNode) return '#fb923c';
    if (currentAlgoStep) {
      if (id === algoCurrentId) return '#38bdf8';
      if (algoVisited.includes(id)) return '#34d399';
    }
    if (playerPath.includes(id)) return '#818cf8';
    return '#64748b';
  }

  function getNodeRing(id: string): string {
    if (id === startNode) return '#eab308';
    if (id === endNode) return '#f97316';
    if (currentAlgoStep && id === algoCurrentId) return '#0ea5e9';
    if (playerPath.includes(id)) return '#6366f1';
    return '#475569';
  }

  function getEdgeColor(sourceId: string, destId: string): string {
    const key = [sourceId, destId].sort().join('-');
    if (relaxedEdge && [relaxedEdge.from, relaxedEdge.to].sort().join('-') === key) return '#facc15';
    if (playerEdgeSet.has(key) && optimalEdgeSet.has(key)) return '#a78bfa';
    if (playerEdgeSet.has(key)) return '#818cf8';
    if (optimalEdgeSet.has(key)) return '#4ade80';
    return '#334155';
  }

  function getEdgeWidth(sourceId: string, destId: string): number {
    const key = [sourceId, destId].sort().join('-');
    if (playerEdgeSet.has(key) || optimalEdgeSet.has(key)) return 3;
    if (relaxedEdge && [relaxedEdge.from, relaxedEdge.to].sort().join('-') === key) return 3;
    return 1.5;
  }

  const nodeMap = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {};
    for (const n of graph.nodes) m[n.id] = { x: n.x, y: n.y };
    return m;
  }, [graph.nodes]);

  const cursorClass = selectingPhase === 'start' || selectingPhase === 'end' ? 'cursor-crosshair' : 'cursor-pointer';

  const prompt = selectingPhase === 'start'
    ? 'Click an intersection to set START DEPOT'
    : selectingPhase === 'end'
      ? 'Click an intersection to set DELIVERY DESTINATION'
      : null;

  const orderedQueue = [...(currentAlgoStep?.queue ?? [])].sort((a, b) => a.distance - b.distance).slice(0, 5);
  const mapStats = {
    intersections: graph.nodes.length,
    roads: graph.edges.length,
    avgTraffic: graph.edges.length
      ? Math.round(graph.edges.reduce((sum, edge) => sum + edge.weight, 0) / graph.edges.length)
      : 0,
  };

  return (
    <div className={`relative flex-1 w-full overflow-hidden rounded-[1.5rem] border border-slate-700/50 bg-slate-950/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-sm ${cursorClass}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.1),transparent_30%)]" />
      {prompt && (
        <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/30 shadow-xl shadow-sky-950/40 animate-pulse">
          {prompt}
        </div>
      )}

      <div className="absolute left-5 top-5 z-10 rounded-2xl border border-slate-700/60 bg-slate-950/85 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-sm">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">City Routing Map</div>
        <div className="mt-2 flex gap-3 text-[11px] text-slate-300">
          <span><strong className="font-mono text-white">{mapStats.intersections}</strong> intersections</span>
          <span><strong className="font-mono text-white">{mapStats.roads}</strong> roads</span>
          <span><strong className="font-mono text-white">{mapStats.avgTraffic}</strong> avg min</span>
        </div>
      </div>

      <div className="absolute right-5 top-5 z-10 hidden rounded-2xl border border-slate-700/60 bg-slate-950/85 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-sm sm:block">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Legend</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-slate-400">
          <LegendDot color="bg-yellow-300" label="Depot" />
          <LegendDot color="bg-orange-400" label="Dropoff" />
          <LegendDot color="bg-indigo-400" label="Your route" />
          <LegendDot color="bg-emerald-400" label="Best route" />
          <LegendDot color="bg-sky-400" label="Scanning" />
          <LegendDot color="bg-slate-500" label="Unvisited" />
        </div>
      </div>

      {currentAlgoStep && (
        <div className="absolute bottom-5 left-5 z-10 max-w-sm rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-xl shadow-black/35 backdrop-blur-sm">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-300">Dijkstra Live Scan</div>
          <p className="text-xs leading-relaxed text-slate-300">{currentAlgoStep.description}</p>
          {orderedQueue.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {orderedQueue.map((item) => (
                <span key={item.id} className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-mono font-semibold text-sky-300 ring-1 ring-sky-500/25">
                  {item.id}: {item.distance}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <svg viewBox="0 0 820 400" className="relative z-0 h-full w-full rounded-[1.15rem]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="dijkstra-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="#334155" strokeWidth="0.7" opacity="0.24" />
          </pattern>
          <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pin-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#020617" floodOpacity="0.65" />
          </filter>
        </defs>

        <rect x="0" y="0" width="820" height="400" rx="24" fill="#020617" />
        <rect x="0" y="0" width="820" height="400" rx="24" fill="url(#dijkstra-grid)" />

        {/* District blocks make the graph read like a real city map. */}
        {[0, 1, 2, 3, 4].map((district) => (
          <rect
            key={district}
            x={30 + district * 155}
            y={district % 2 === 0 ? 38 : 238}
            width={112 + (district % 2) * 34}
            height={78}
            rx={18}
            fill={DISTRICT_COLORS[district]}
            opacity="0.26"
          />
        ))}
        <path d="M612 40C690 68 760 70 800 42V132C744 154 684 146 612 118Z" fill="#075985" opacity="0.18" />
        <path d="M38 336C96 302 150 306 206 338C154 374 91 382 38 356Z" fill="#166534" opacity="0.22" />

        {/* Road shadows and asphalt casings */}
        {graph.edges.map((edge) => {
          const s = nodeMap[edge.source];
          const d = nodeMap[edge.destination];
          if (!s || !d) return null;
          const color = getEdgeColor(edge.source, edge.destination);
          const width = getEdgeWidth(edge.source, edge.destination);

          return (
            <g key={`${edge.id}-road-base`}>
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke="#020617" strokeWidth={17} strokeLinecap="round"
                opacity={0.7}
              />
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke="#1e293b" strokeWidth={13} strokeLinecap="round"
              />
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke="#475569" strokeWidth={8} strokeLinecap="round"
                opacity={0.78}
              />
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke="#cbd5e1" strokeWidth={1.2} strokeLinecap="round"
                strokeDasharray="5 8"
                opacity={0.34}
              />
              {(playerEdgeSet.has([edge.source, edge.destination].sort().join('-')) || optimalEdgeSet.has([edge.source, edge.destination].sort().join('-')) || (relaxedEdge && [relaxedEdge.from, relaxedEdge.to].sort().join('-') === [edge.source, edge.destination].sort().join('-'))) && (
                <line
                  x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                  stroke={color} strokeWidth={width + 6} strokeLinecap="round"
                  opacity={0.34}
                  filter="url(#soft-glow)"
                />
              )}
            </g>
          );
        })}

        {/* Active route overlays and time signs */}
        {graph.edges.map((edge) => {
          const s = nodeMap[edge.source];
          const d = nodeMap[edge.destination];
          if (!s || !d) return null;
          const color = getEdgeColor(edge.source, edge.destination);
          const width = getEdgeWidth(edge.source, edge.destination);
          const mx = (s.x + d.x) / 2;
          const my = (s.y + d.y) / 2;
          const key = [edge.source, edge.destination].sort().join('-');
          const isActive = playerEdgeSet.has(key) || optimalEdgeSet.has(key) || (relaxedEdge && [relaxedEdge.from, relaxedEdge.to].sort().join('-') === key);

          return (
            <g key={edge.id}>
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke={color} strokeWidth={isActive ? width + 2 : 1.4} strokeLinecap="round"
                opacity={isActive ? 0.96 : 0.18}
                strokeDasharray={optimalEdgeSet.has(key) && !playerEdgeSet.has(key) ? '9 6' : undefined}
              />
              <rect
                x={mx - 17} y={my - 11} width={34} height={22} rx={8}
                fill="#020617" fillOpacity={0.92} stroke={isActive ? color : '#475569'} strokeWidth={0.8}
                filter="url(#pin-shadow)"
              />
              <text
                x={mx} y={my + 0.5}
                textAnchor="middle" dominantBaseline="central"
                fontSize={9} fontWeight={800} fontFamily="ui-monospace, monospace"
                fill={isActive ? color : '#cbd5e1'} fillOpacity={0.95}
              >
                {edge.weight}m
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const fill = getNodeColor(node.id);
          const ring = getNodeRing(node.id);
          const dist = currentAlgoStep?.distances[node.id];
          const distLabel = dist !== undefined && dist !== Infinity ? dist.toString() : '';
          const isDepot = node.id === startNode;
          const isDropoff = node.id === endNode;
          const isCurrent = currentAlgoStep && node.id === algoCurrentId;
          const isVisited = currentAlgoStep && algoVisited.includes(node.id);

          return (
            <g key={node.id} onClick={() => onClickNode(node.id)} className="cursor-pointer">
              <circle
                cx={node.x} cy={node.y} r={NODE_R + 12}
                fill={fill} fillOpacity={isCurrent ? 0.22 : 0.08}
                filter={isCurrent ? 'url(#soft-glow)' : undefined}
              />
              <circle
                cx={node.x} cy={node.y} r={NODE_R + 5}
                fill="#020617"
                stroke="#0f172a"
                strokeWidth={7}
                filter="url(#pin-shadow)"
              />
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={fill} fillOpacity={isDepot || isDropoff || isCurrent || isVisited ? 0.32 : 0.16}
                stroke={ring} strokeWidth={isDepot || isDropoff ? 4 : 2.5}
              />
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={900} fontFamily="ui-monospace, monospace"
                fill={fill}
              >
                {node.id}
              </text>
              {(isDepot || isDropoff) && (
                <g>
                  <path
                    d={`M${node.x - 8} ${node.y - 41}h16a7 7 0 0 1 7 7v12a7 7 0 0 1-7 7h-16a7 7 0 0 1-7-7v-12a7 7 0 0 1 7-7Z`}
                    fill={isDepot ? '#eab308' : '#f97316'}
                    opacity="0.95"
                    filter="url(#pin-shadow)"
                  />
                  <text
                    x={node.x} y={node.y - 28}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={9} fontWeight={900} fontFamily="ui-monospace, monospace"
                    fill="#020617"
                  >
                    {isDepot ? 'START' : 'END'}
                  </text>
                </g>
              )}
              {distLabel && (
                <g>
                  <rect x={node.x - 20} y={node.y + NODE_R + 8} width={40} height={16} rx={8} fill="#020617" stroke="#334155" />
                  <text
                    x={node.x} y={node.y + NODE_R + 16.5}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={8} fontWeight={700} fontFamily="ui-monospace, monospace"
                    fill="#94a3b8"
                  >
                    ETA {distLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
