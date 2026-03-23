import { memo, useMemo } from 'react';
import type { GitState } from '../types/git';

const BRANCH_COLORS = [
  '#818cf8', // indigo-400
  '#34d399', // emerald-400
  '#fb923c', // orange-400
  '#f472b6', // pink-400
  '#38bdf8', // sky-400
  '#a78bfa', // violet-400
  '#fbbf24', // amber-400
  '#2dd4bf', // teal-400
  '#f87171', // red-400
  '#c084fc', // purple-400
];

const NODE_RADIUS = 16;
const ROW_HEIGHT = 64;
const COL_WIDTH = 40;
const LEFT_PAD = 50;
const TOP_PAD = 50;
const LABEL_OFFSET = 28;

interface Props {
  state: GitState;
}

function GitCanvasInner({ state }: Props) {
  const { commits, branches, tags, head, detachedHead, commitOrder } = state;

  const layout = useMemo(() => {
    if (commitOrder.length === 0) return { nodes: [], edges: [], labels: [], width: 400, height: 300 };

    const branchColorMap = new Map<string, string>();
    branches.forEach((b, i) => {
      branchColorMap.set(b.name, BRANCH_COLORS[i % BRANCH_COLORS.length]);
    });

    const branchColumns = new Map<string, number>();
    let nextCol = 0;

    const displayed = [...commitOrder].reverse();

    const commitColumn = new Map<string, number>();
    for (const id of displayed) {
      const commit = commits[id];
      if (!commit) continue;
      const branchName = commit.branch;
      if (!branchColumns.has(branchName)) {
        branchColumns.set(branchName, nextCol++);
      }
      commitColumn.set(id, branchColumns.get(branchName)!);
    }

    const nodes = displayed.map((id, i) => {
      const commit = commits[id];
      const col = commitColumn.get(id) ?? 0;
      return {
        id,
        x: LEFT_PAD + col * COL_WIDTH,
        y: TOP_PAD + i * ROW_HEIGHT,
        commit,
        color: branchColorMap.get(commit.branch) ?? BRANCH_COLORS[0],
        col,
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const edges: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; isMerge: boolean }[] = [];
    for (const node of nodes) {
      for (let pi = 0; pi < node.commit.parentIds.length; pi++) {
        const parentNode = nodeMap.get(node.commit.parentIds[pi]);
        if (!parentNode) continue;
        edges.push({
          from: { x: node.x, y: node.y },
          to: { x: parentNode.x, y: parentNode.y },
          color: pi === 0 ? node.color : parentNode.color,
          isMerge: pi > 0,
        });
      }
    }

    const headCommitId = detachedHead ? head : branches.find(b => b.name === head)?.commitId;
    const currentBranch = detachedHead ? null : head;

    const labels: {
      text: string;
      commitId: string;
      x: number;
      y: number;
      color: string;
      isHead: boolean;
      isTag: boolean;
    }[] = [];

    for (const branch of branches) {
      const node = nodeMap.get(branch.commitId);
      if (!node) continue;
      const isHead = branch.name === currentBranch;
      const existingCount = labels.filter(l => l.commitId === branch.commitId).length;
      labels.push({
        text: branch.name,
        commitId: branch.commitId,
        x: node.x + NODE_RADIUS + 12,
        y: node.y - 6 + existingCount * 22,
        color: branchColorMap.get(branch.name) ?? BRANCH_COLORS[0],
        isHead,
        isTag: false,
      });
    }

    for (const tag of tags) {
      const node = nodeMap.get(tag.commitId);
      if (!node) continue;
      const existingCount = labels.filter(l => l.commitId === tag.commitId).length;
      labels.push({
        text: tag.name,
        commitId: tag.commitId,
        x: node.x + NODE_RADIUS + 12,
        y: node.y - 6 + existingCount * 22,
        color: '#fbbf24',
        isHead: false,
        isTag: true,
      });
    }

    const maxCol = nextCol;
    const width = Math.max(400, LEFT_PAD * 2 + maxCol * COL_WIDTH + 200);
    const height = Math.max(300, TOP_PAD * 2 + displayed.length * ROW_HEIGHT);

    return { nodes, edges, labels, width, height, headCommitId };
  }, [commits, branches, tags, head, detachedHead, commitOrder]);

  if (commitOrder.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
        <div className="text-center px-6">
          <div className="mb-3 text-4xl opacity-40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-500">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="21" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No commits yet</p>
          <p className="text-xs text-slate-600 mt-1">Run <code className="text-indigo-400">git init</code> to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M6 21V9a9 9 0 0 0 9 9" />
        </svg>
        <span className="text-xs font-semibold text-slate-300">Commit Graph</span>
        <span className="ml-auto text-[10px] text-slate-500">{commitOrder.length} commit{commitOrder.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <svg
          width={layout.width}
          height={layout.height}
          className="block"
          style={{ minWidth: layout.width, minHeight: layout.height }}
        >
          {layout.edges.map((edge, i) => {
            if (edge.from.x === edge.to.x) {
              return (
                <line
                  key={`e${i}`}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={edge.color}
                  strokeWidth={2}
                  opacity={edge.isMerge ? 0.5 : 0.7}
                  strokeDasharray={edge.isMerge ? '6,3' : undefined}
                />
              );
            }
            const midY = (edge.from.y + edge.to.y) / 2;
            return (
              <path
                key={`e${i}`}
                d={`M${edge.from.x},${edge.from.y} C${edge.from.x},${midY} ${edge.to.x},${midY} ${edge.to.x},${edge.to.y}`}
                stroke={edge.color}
                strokeWidth={2}
                fill="none"
                opacity={edge.isMerge ? 0.5 : 0.7}
                strokeDasharray={edge.isMerge ? '6,3' : undefined}
              />
            );
          })}

          {layout.nodes.map(node => {
            const isHead = node.id === layout.headCommitId;
            return (
              <g key={node.id}>
                {isHead && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    opacity={0.4}
                  >
                    <animate attributeName="r" values={`${NODE_RADIUS + 3};${NODE_RADIUS + 6};${NODE_RADIUS + 3}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={isHead ? node.color : `${node.color}33`}
                  stroke={node.color}
                  strokeWidth={isHead ? 3 : 2}
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="select-none pointer-events-none"
                  fill={isHead ? '#0f172a' : node.color}
                  fontSize={8}
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  {node.id.slice(0, 4)}
                </text>
                <text
                  x={node.x}
                  y={node.y + LABEL_OFFSET}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={9}
                  className="select-none pointer-events-none"
                >
                  {node.commit.message.length > 22
                    ? node.commit.message.slice(0, 20) + '...'
                    : node.commit.message}
                </text>
              </g>
            );
          })}

          {layout.labels.map((label, i) => (
            <g key={`l${i}`}>
              <rect
                x={label.x - 2}
                y={label.y - 8}
                width={label.text.length * 7.5 + (label.isHead ? 40 : 8) + (label.isTag ? 10 : 0)}
                height={18}
                rx={4}
                fill={`${label.color}22`}
                stroke={label.color}
                strokeWidth={1}
                opacity={0.8}
              />
              {label.isTag && (
                <text
                  x={label.x + 4}
                  y={label.y + 4}
                  fill={label.color}
                  fontSize={8}
                >
                  🏷
                </text>
              )}
              {label.isHead && (
                <text
                  x={label.x + 4}
                  y={label.y + 4}
                  fill="#fbbf24"
                  fontSize={9}
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  HEAD→
                </text>
              )}
              <text
                x={label.x + (label.isHead ? 44 : label.isTag ? 18 : 4)}
                y={label.y + 4}
                fill={label.color}
                fontSize={10}
                fontWeight={600}
                fontFamily="monospace"
              >
                {label.text}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export const GitCanvas = memo(GitCanvasInner);
