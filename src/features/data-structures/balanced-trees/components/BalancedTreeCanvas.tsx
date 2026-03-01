import { useMemo } from 'react';
import type { BTreeNode, TreeType } from '../types/balancedTree';

interface BalancedTreeCanvasProps {
  root: BTreeNode | null;
  treeType: TreeType;
  highlightIds: number[];
}

function getNodes(node: BTreeNode | null): BTreeNode[] {
  if (!node) return [];
  return [node, ...getNodes(node.left), ...getNodes(node.right)];
}

interface Edge { from: BTreeNode; to: BTreeNode }

function getEdges(node: BTreeNode | null): Edge[] {
  if (!node) return [];
  const edges: Edge[] = [];
  if (node.left) { edges.push({ from: node, to: node.left }); edges.push(...getEdges(node.left)); }
  if (node.right) { edges.push({ from: node, to: node.right }); edges.push(...getEdges(node.right)); }
  return edges;
}

export default function BalancedTreeCanvas({ root, treeType, highlightIds }: BalancedTreeCanvasProps) {
  const nodes = useMemo(() => getNodes(root), [root]);
  const edges = useMemo(() => getEdges(root), [root]);

  if (!root) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950/80 text-slate-500">
        No tree — insert a value to begin
      </div>
    );
  }

  const minX = Math.min(...nodes.map((n) => n.x), 0) - 40;
  const maxX = Math.max(...nodes.map((n) => n.x), 0) + 40;
  const maxY = Math.max(...nodes.map((n) => n.y), 0) + 40;
  const width = maxX - minX + 80;
  const height = maxY + 80;

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
            stroke="#475569"
            strokeWidth={2}
            strokeOpacity={0.5}
          />
        ))}

        {nodes.map((node) => {
          const isHighlighted = highlightIds.includes(node.id);
          const isRB = treeType === 'rbtree';

          let fill = '#1e293b';
          let stroke = '#475569';
          let textColor = '#e2e8f0';

          if (isRB) {
            if (node.color === 'red') {
              fill = isHighlighted ? '#f87171' : '#dc2626';
              stroke = '#fca5a5';
              textColor = '#ffffff';
            } else {
              fill = isHighlighted ? '#475569' : '#1e293b';
              stroke = isHighlighted ? '#94a3b8' : '#64748b';
              textColor = '#e2e8f0';
            }
          } else if (isHighlighted) {
            fill = '#fbbf24';
            stroke = '#f59e0b';
            textColor = '#1e293b';
          }

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                fill={fill}
                stroke={stroke}
                strokeWidth={isHighlighted ? 3 : 2}
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
              {treeType === 'avl' && (
                <text
                  x={node.x + 20}
                  y={node.y - 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                >
                  h{node.height}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
