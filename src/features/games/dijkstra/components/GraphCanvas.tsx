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
    ? 'Click a node to set START'
    : selectingPhase === 'end'
      ? 'Click a node to set DESTINATION'
      : null;

  return (
    <div className={`flex-1 w-full rounded-xl border border-slate-700/50 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-sm overflow-hidden relative ${cursorClass}`}>
      {prompt && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-slate-800/90 px-4 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700/50 animate-pulse">
          {prompt}
        </div>
      )}
      <svg viewBox="0 0 820 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Edges */}
        {graph.edges.map((edge) => {
          const s = nodeMap[edge.source];
          const d = nodeMap[edge.destination];
          if (!s || !d) return null;
          const color = getEdgeColor(edge.source, edge.destination);
          const width = getEdgeWidth(edge.source, edge.destination);
          const mx = (s.x + d.x) / 2;
          const my = (s.y + d.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke={color} strokeWidth={width} strokeLinecap="round"
                opacity={0.7}
              />
              <rect
                x={mx - 10} y={my - 8} width={20} height={16} rx={4}
                fill="#0f172a" fillOpacity={0.85} stroke={color} strokeWidth={0.5}
              />
              <text
                x={mx} y={my + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={10} fontWeight={700} fontFamily="ui-monospace, monospace"
                fill={color} fillOpacity={0.9}
              >
                {edge.weight}
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

          return (
            <g key={node.id} onClick={() => onClickNode(node.id)} className="cursor-pointer">
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={fill} fillOpacity={0.15}
                stroke={ring} strokeWidth={2}
              />
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace"
                fill={fill}
              >
                {node.id}
              </text>
              {distLabel && (
                <text
                  x={node.x} y={node.y - NODE_R - 6}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontWeight={600} fontFamily="ui-monospace, monospace"
                  fill="#94a3b8"
                >
                  d={distLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
