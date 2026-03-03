import type { ListNode, LLStep, LLHighlightColor } from '../hooks/useLinkedList';

interface LinkedListCanvasProps {
  nodes: ListNode[];
  currentStep: LLStep | null;
}

const NODE_COLORS: Record<LLHighlightColor, { border: string; bg: string; text: string }> = {
  green:  { border: '#34d399', bg: 'rgba(52,211,153,0.15)', text: '#6ee7b7' },
  red:    { border: '#f87171', bg: 'rgba(248,113,113,0.15)', text: '#fca5a5' },
  yellow: { border: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  text: '#fde68a' },
  blue:   { border: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  text: '#93c5fd' },
};

const DEFAULT_NODE = { border: '#475569', bg: 'rgba(30,41,59,0.7)', text: '#cbd5e1' };

const NODE_W = 64;
const NODE_H = 48;
const ARROW_W = 36;
const NODE_STEP = NODE_W + ARROW_W;
const NODES_PER_ROW = 5;

export default function LinkedListCanvas({ nodes, currentStep }: LinkedListCanvasProps) {
  const highlightIds = currentStep?.highlightIds ?? new Set<number>();
  const highlightColor = currentStep?.highlightColor ?? null;

  const rows: ListNode[][] = [];
  for (let i = 0; i < nodes.length; i += NODES_PER_ROW) {
    rows.push(nodes.slice(i, i + NODES_PER_ROW));
  }

  const totalWidth = Math.min(nodes.length, NODES_PER_ROW) * NODE_STEP + ARROW_W;
  const rowH = NODE_H + 40;
  const svgHeight = Math.max(rows.length * rowH + 20, 120);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-4 px-4 overflow-auto">
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center w-48 h-16 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs">
          Empty List — null
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${totalWidth + 20} ${svgHeight}`}
          width="100%"
          style={{ maxWidth: `${totalWidth + 20}px`, overflow: 'visible' }}
        >
          {rows.map((row, rowIdx) => {
            const y = rowIdx * rowH + 20;
            const isLastRow = rowIdx === rows.length - 1;
            const globalOffset = rowIdx * NODES_PER_ROW;

            return (
              <g key={rowIdx}>
                {row.map((node, colIdx) => {
                  const x = colIdx * NODE_STEP + ARROW_W / 2;
                  const isHighlighted = highlightIds.has(node.id);
                  const colors = isHighlighted && highlightColor ? NODE_COLORS[highlightColor] : DEFAULT_NODE;
                  const globalIdx = globalOffset + colIdx;
                  const isFirst = globalIdx === 0;
                  const isLast = globalIdx === nodes.length - 1;
                  const isLastInRow = colIdx === row.length - 1;

                  return (
                    <g key={node.id}>
                      {/* Head label */}
                      {isFirst && (
                        <text x={x + NODE_W / 2} y={y - 8} textAnchor="middle" fontSize="10" fill="#818cf8" fontFamily="monospace">
                          head
                        </text>
                      )}

                      {/* Node box */}
                      <rect
                        x={x}
                        y={y}
                        width={NODE_W}
                        height={NODE_H}
                        rx={8}
                        fill={colors.bg}
                        stroke={colors.border}
                        strokeWidth={isHighlighted ? 2 : 1.5}
                      />

                      {/* Value */}
                      <text
                        x={x + NODE_W * 0.38}
                        y={y + NODE_H / 2 + 5}
                        textAnchor="middle"
                        fontSize="15"
                        fontWeight="bold"
                        fill={colors.text}
                        fontFamily="sans-serif"
                      >
                        {node.value}
                      </text>

                      {/* Divider */}
                      <line
                        x1={x + NODE_W * 0.62}
                        y1={y + 4}
                        x2={x + NODE_W * 0.62}
                        y2={y + NODE_H - 4}
                        stroke={colors.border}
                        strokeWidth={1}
                        opacity={0.5}
                      />

                      {/* Next pointer box content */}
                      <text
                        x={x + NODE_W * 0.82}
                        y={y + NODE_H / 2 + 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748b"
                        fontFamily="monospace"
                      >
                        {isLast ? 'null' : '→'}
                      </text>

                      {/* Arrow to next node (same row) */}
                      {!isLast && !isLastInRow && (
                        <g>
                          <line
                            x1={x + NODE_W}
                            y1={y + NODE_H / 2}
                            x2={x + NODE_STEP}
                            y2={y + NODE_H / 2}
                            stroke="#475569"
                            strokeWidth={1.5}
                          />
                          <polygon
                            points={`${x + NODE_STEP},${y + NODE_H / 2} ${x + NODE_STEP - 6},${y + NODE_H / 2 - 4} ${x + NODE_STEP - 6},${y + NODE_H / 2 + 4}`}
                            fill="#475569"
                          />
                        </g>
                      )}

                      {/* Wrap arrow: end of row → start of next row */}
                      {isLastInRow && !isLastRow && (
                        <g>
                          <path
                            d={`M ${x + NODE_W} ${y + NODE_H / 2} L ${x + NODE_W + 14} ${y + NODE_H / 2} L ${x + NODE_W + 14} ${y + NODE_H + 20} L ${ARROW_W / 2} ${y + NODE_H + 20} L ${ARROW_W / 2} ${y + rowH}`}
                            fill="none"
                            stroke="#475569"
                            strokeWidth={1.5}
                          />
                          <polygon
                            points={`${ARROW_W / 2},${y + rowH} ${ARROW_W / 2 - 4},${y + rowH - 6} ${ARROW_W / 2 + 4},${y + rowH - 6}`}
                            fill="#475569"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}

      {/* Description */}
      {currentStep?.description && (
        <div className="w-full max-w-sm rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs text-indigo-300 leading-relaxed">
          {currentStep.description}
        </div>
      )}

      {/* Size */}
      <div className="text-xs text-slate-500 font-mono">
        length = {nodes.length}
      </div>
    </div>
  );
}
