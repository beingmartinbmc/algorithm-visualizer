import { useCallback, useRef, useState, useEffect } from 'react';
import type { GridMatrix } from '../../types/graph';
import type { DrawMode } from '../../hooks/useGrid';
import Node from './Node';

interface GridProps {
  grid: GridMatrix;
  isRunning: boolean;
  isDrawing: boolean;
  drawMode: DrawMode;
  setIsDrawing: (v: boolean) => void;
  handleNodeInteraction: (row: number, col: number) => void;
}

export default function Grid({
  grid,
  isRunning,
  isDrawing,
  setIsDrawing,
  handleNodeInteraction,
}: GridProps) {
  const onMouseDown = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      setIsDrawing(true);
      handleNodeInteraction(row, col);
    },
    [isRunning, setIsDrawing, handleNodeInteraction]
  );

  const onMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isDrawing || isRunning) return;
      handleNodeInteraction(row, col);
    },
    [isDrawing, isRunning, handleNodeInteraction]
  );

  const onMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, [setIsDrawing]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const gridEl = gridRef.current;
    if (!wrapper || !gridEl) return;

    const updateScale = () => {
      const wrapperWidth = wrapper.clientWidth;
      const gridWidth = gridEl.scrollWidth;
      if (gridWidth > wrapperWidth) {
        setScale(wrapperWidth / gridWidth);
      } else {
        setScale(1);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [grid]);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden">
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', height: gridRef.current ? gridRef.current.scrollHeight * scale : 'auto' }}
      >
        <div
          ref={gridRef}
          className="inline-block rounded-xl border border-slate-700/50 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-sm"
          onMouseLeave={() => setIsDrawing(false)}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((node) => (
                <Node
                  key={`${node.row}-${node.col}`}
                  row={node.row}
                  col={node.col}
                  type={node.type}
                  onMouseDown={onMouseDown}
                  onMouseEnter={onMouseEnter}
                  onMouseUp={onMouseUp}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
