import { useMemo } from 'react';
import type { LayoutNode } from '../engine/trieEngine';

interface TrieCanvasProps {
  layout: LayoutNode[];
  matchedNodeIds: Set<string>;
  currentStepNodeId: string | null;
}

export default function TrieCanvas({ layout, matchedNodeIds, currentStepNodeId }: TrieCanvasProps) {
  const { viewBox, edges } = useMemo(() => {
    if (layout.length === 0) return { viewBox: '0 0 100 100', edges: [] };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of layout) {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    }

    const padding = 40;
    const vb = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

    const nodeMap = new Map<string, LayoutNode>();
    for (const n of layout) nodeMap.set(n.id, n);

    const edgeList: { x1: number; y1: number; x2: number; y2: number; highlighted: boolean }[] = [];
    for (const n of layout) {
      if (n.parentId && nodeMap.has(n.parentId)) {
        const parent = nodeMap.get(n.parentId)!;
        const highlighted = matchedNodeIds.has(n.id) && matchedNodeIds.has(parent.id);
        edgeList.push({ x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, highlighted });
      }
    }

    return { viewBox: vb, edges: edgeList };
  }, [layout, matchedNodeIds]);

  if (layout.length === 0) {
    return (
      <div className="flex flex-1 w-full min-h-[200px] items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950/80 text-slate-500 text-sm">
        Add words to build the trie
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[200px] rounded-xl border border-slate-700/50 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
      <svg viewBox={viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Edges */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.highlighted ? '#818cf8' : '#334155'}
            strokeWidth={e.highlighted ? 2.5 : 1.5}
            strokeOpacity={e.highlighted ? 1 : 0.5}
          />
        ))}

        {/* Nodes */}
        {layout.map((node) => {
          const isMatched = matchedNodeIds.has(node.id);
          const isCurrent = currentStepNodeId === node.id;
          const isRoot = node.depth === 0;

          let fill = '#1e293b';
          let stroke = '#475569';
          let textFill = '#94a3b8';

          if (isCurrent) {
            fill = '#312e81';
            stroke = '#818cf8';
            textFill = '#e0e7ff';
          } else if (isMatched) {
            fill = '#1e1b4b';
            stroke = '#6366f1';
            textFill = '#c7d2fe';
          }

          if (node.isEndOfWord && !isCurrent) {
            stroke = isMatched ? '#34d399' : '#059669';
          }

          const radius = isRoot ? 16 : 14;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={isCurrent ? 3 : 2}
              />
              {isCurrent && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 4}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                  className="animate-pulse"
                />
              )}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textFill}
                fontSize={isRoot ? 10 : 12}
                fontWeight={700}
                fontFamily="ui-monospace, monospace"
              >
                {isRoot ? 'root' : node.char}
              </text>
              {node.isEndOfWord && (
                <circle
                  cx={node.x + radius - 2}
                  cy={node.y - radius + 2}
                  r={4}
                  fill="#34d399"
                  stroke="#064e3b"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
