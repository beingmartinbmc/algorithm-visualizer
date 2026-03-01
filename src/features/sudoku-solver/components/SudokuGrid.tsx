import { memo, useEffect, useCallback, useRef } from 'react';
import type { SudokuGrid, GridSize, CellValue } from '../types/sudoku';
import { getBoxDimensions } from '../types/sudoku';

interface SudokuGridProps {
  grid: SudokuGrid;
  gridSize: GridSize;
  isEditing: boolean;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  onCellValueChange: (row: number, col: number, value: CellValue) => void;
}

function getCellSize(size: GridSize): string {
  if (size === 4) return 'w-16 h-16 text-2xl';
  if (size === 9) return 'w-12 h-12 text-lg';
  return 'w-8 h-8 text-[11px]';
}

function formatValue(value: number | null, size: GridSize): string {
  if (value === null) return '';
  if (size <= 9) return String(value);
  return value.toString(16).toUpperCase();
}

function SudokuGridComponent({ grid, gridSize, isEditing, selectedCell, onCellClick, onCellValueChange }: SudokuGridProps) {
  const { boxRows, boxCols } = getBoxDimensions(gridSize);
  const cellSize = getCellSize(gridSize);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditing || !selectedCell) return;
    const { row, col } = selectedCell;

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      onCellValueChange(row, col, null);
      return;
    }

    if (e.key === 'ArrowUp' && row > 0) { onCellClick(row - 1, col); return; }
    if (e.key === 'ArrowDown' && row < gridSize - 1) { onCellClick(row + 1, col); return; }
    if (e.key === 'ArrowLeft' && col > 0) { onCellClick(row, col - 1); return; }
    if (e.key === 'ArrowRight' && col < gridSize - 1) { onCellClick(row, col + 1); return; }

    if (gridSize <= 9) {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= gridSize) {
        onCellValueChange(row, col, num);
      }
    } else {
      const hex = parseInt(e.key, 16);
      if (!isNaN(hex) && hex >= 1 && hex <= gridSize) {
        onCellValueChange(row, col, hex);
      }
    }
  }, [isEditing, selectedCell, gridSize, onCellClick, onCellValueChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus hidden input when a cell is selected in edit mode (triggers mobile keyboard)
  useEffect(() => {
    if (isEditing && selectedCell && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [isEditing, selectedCell]);

  const handleMobileInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (!isEditing || !selectedCell) return;
    const val = e.currentTarget.value;
    e.currentTarget.value = '';
    if (!val) return;
    const char = val.slice(-1);

    if (char === '0') {
      onCellValueChange(selectedCell.row, selectedCell.col, null);
      return;
    }

    if (gridSize <= 9) {
      const num = parseInt(char);
      if (!isNaN(num) && num >= 1 && num <= gridSize) {
        onCellValueChange(selectedCell.row, selectedCell.col, num);
      }
    } else {
      const hex = parseInt(char, 16);
      if (!isNaN(hex) && hex >= 1 && hex <= gridSize) {
        onCellValueChange(selectedCell.row, selectedCell.col, hex);
      }
    }
  }, [isEditing, selectedCell, gridSize, onCellValueChange]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (!isEditing) return;
    onCellClick(r, c);
    // Re-focus hidden input to keep mobile keyboard open
    setTimeout(() => hiddenInputRef.current?.focus(), 0);
  }, [isEditing, onCellClick]);

  return (
    <div className="relative">
      {/* Hidden input for mobile keyboard */}
      {isEditing && (
        <input
          ref={hiddenInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          onInput={handleMobileInput}
          aria-label="Sudoku cell input"
        />
      )}
      <div
        className="inline-grid rounded-xl border-2 border-slate-500/60 bg-slate-950/80 backdrop-blur-sm shadow-2xl overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isRightBoxBorder = (c + 1) % boxCols === 0 && c < gridSize - 1;
            const isBottomBoxBorder = (r + 1) % boxRows === 0 && r < gridSize - 1;
            const isSelected = cell.isHighlighted;

            let bgColor = 'bg-slate-900/60';
            if (isSelected) {
              bgColor = 'bg-indigo-500/20 ring-2 ring-inset ring-indigo-400/60';
            } else if (cell.isCurrent) {
              bgColor = cell.value !== null
                ? 'bg-emerald-500/25 ring-2 ring-inset ring-emerald-400/50'
                : 'bg-rose-500/20 ring-2 ring-inset ring-rose-400/40';
            } else if (cell.isError) {
              bgColor = 'bg-rose-500/20';
            }

            let textColor = 'text-slate-300';
            if (cell.isOriginal) {
              textColor = 'text-white font-bold';
            } else if (cell.value !== null) {
              textColor = 'text-indigo-300 font-semibold';
            }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`
                  ${cellSize} flex items-center justify-center
                  border border-slate-800/40
                  ${isRightBoxBorder ? 'border-r-2 border-r-slate-500/60' : ''}
                  ${isBottomBoxBorder ? 'border-b-2 border-b-slate-500/60' : ''}
                  ${bgColor} ${textColor}
                  transition-all duration-150 select-none
                  ${isEditing ? 'cursor-pointer hover:bg-slate-800/60' : ''}
                `}
              >
                {formatValue(cell.value, gridSize)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(SudokuGridComponent);
