import { memo } from 'react';
import { NodeType } from '../../types/graph';

interface NodeProps {
  row: number;
  col: number;
  type: NodeType;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

const nodeStyles: Record<NodeType, string> = {
  [NodeType.EMPTY]: 'bg-slate-900/40 hover:bg-slate-700/60',
  [NodeType.WALL]: 'bg-slate-300 animate-wall',
  [NodeType.START]: 'bg-emerald-500 shadow-lg shadow-emerald-500/30',
  [NodeType.END]: 'bg-rose-500 shadow-lg shadow-rose-500/30',
  [NodeType.VISITED]: 'bg-indigo-500/70 animate-visited',
  [NodeType.PATH]: 'bg-amber-400 animate-path shadow-md shadow-amber-400/30',
  [NodeType.EXPLORING]: 'bg-cyan-400 animate-pulse',
};

function NodeComponent({ row, col, type, onMouseDown, onMouseEnter, onMouseUp }: NodeProps) {
  return (
    <div
      className={`
        w-[22px] h-[22px] border border-slate-800/30 transition-colors duration-100
        cursor-pointer select-none ${nodeStyles[type]}
      `}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
      role="button"
      aria-label={`Node ${row},${col} - ${type}`}
    />
  );
}

export default memo(NodeComponent, (prev, next) => {
  return prev.type === next.type && prev.row === next.row && prev.col === next.col;
});
