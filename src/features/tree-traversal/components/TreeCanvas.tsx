import { useMemo } from 'react';
import type { TreeNode } from '../types/tree';
import { getTreeNodes, getTreeEdges } from '../algorithms/generator';

interface TreeCanvasProps {
  root: TreeNode | null;
  visitedIds: Set<number>;
  processedIds: Set<number>;
  currentId: number | null;
  processOrder: number[];
}

export default function TreeCanvas({ root, visitedIds, processedIds, currentId, processOrder }: TreeCanvasProps) {
  const nodes = useMemo(() => getTreeNodes(root), [root]);
  const edges = useMemo(() => getTreeEdges(root), [root]);

  const minX = Math.min(...nodes.map((n) => n.x), 0) - 40;
  const maxX = Math.max(...nodes.map((n) => n.x), 0) + 40;
  const maxY = Math.max(...nodes.map((n) => n.y), 0) + 40;
  const width = maxX - minX + 80;
  const height = maxY + 80;

  if (!root) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950/80 text-slate-500">
        No tree generated
      </div>
    );
  }

  return (
    <div className="flex-1 w-full rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-sm overflow-auto">
      <svg
        viewBox={`${minX - 40} -20 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke={
              processedIds.has(edge.from.id) && processedIds.has(edge.to.id)
                ? '#818cf8'
                : visitedIds.has(edge.from.id) && visitedIds.has(edge.to.id)
                  ? '#64748b'
                  : '#334155'
            }
            strokeWidth={2}
            strokeOpacity={0.6}
          />
        ))}

        {nodes.map((node) => {
          const isCurrent = node.id === currentId;
          const isProcessed = processedIds.has(node.id);
          const isVisited = visitedIds.has(node.id);
          const orderIndex = processOrder.indexOf(node.id);

          let fill = '#1e293b';
          let stroke = '#475569';
          let textColor = '#94a3b8';

          if (isCurrent) {
            fill = '#fbbf24';
            stroke = '#f59e0b';
            textColor = '#1e293b';
          } else if (isProcessed) {
            fill = '#6366f1';
            stroke = '#818cf8';
            textColor = '#ffffff';
          } else if (isVisited) {
            fill = '#334155';
            stroke = '#64748b';
            textColor = '#cbd5e1';
          }

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                fill={fill}
                stroke={stroke}
                strokeWidth={2.5}
                className="transition-all duration-200"
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                fontSize={12}
                fontWeight={600}
                fontFamily="ui-monospace, monospace"
              >
                {node.value}
              </text>
              {orderIndex >= 0 && (
                <text
                  x={node.x + 18}
                  y={node.y - 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#a5b4fc"
                  fontSize={9}
                  fontWeight={700}
                  fontFamily="ui-monospace, monospace"
                >
                  {orderIndex + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
