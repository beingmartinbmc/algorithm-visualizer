export type GridSize = 4 | 9 | 16;

export type CellValue = number | null;

export interface SudokuCell {
  value: CellValue;
  isOriginal: boolean;
  isHighlighted: boolean;
  isError: boolean;
  isCurrent: boolean;
}

export type SudokuGrid = SudokuCell[][];

export interface SolverStep {
  grid: CellValue[][];
  row: number;
  col: number;
  value: CellValue;
  action: 'place' | 'remove' | 'solved';
}

export const GRID_SIZE_INFO: Record<GridSize, { label: string; boxRows: number; boxCols: number; difficulty: string }> = {
  4: { label: '4×4', boxRows: 2, boxCols: 2, difficulty: 'Easy' },
  9: { label: '9×9', boxRows: 3, boxCols: 3, difficulty: 'Standard' },
  16: { label: '16×16', boxRows: 4, boxCols: 4, difficulty: 'Hard' },
};

export function getBoxDimensions(size: GridSize): { boxRows: number; boxCols: number } {
  return GRID_SIZE_INFO[size];
}
