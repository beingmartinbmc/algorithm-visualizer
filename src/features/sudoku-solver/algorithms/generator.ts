import type { CellValue, GridSize } from '../types/sudoku';
import { getBoxDimensions } from '../types/sudoku';

function isValid(grid: CellValue[][], row: number, col: number, num: number, size: GridSize): boolean {
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === num) return false;
  }
  const { boxRows, boxCols } = getBoxDimensions(size);
  const boxStartRow = Math.floor(row / boxRows) * boxRows;
  const boxStartCol = Math.floor(col / boxCols) * boxCols;
  for (let r = boxStartRow; r < boxStartRow + boxRows; r++) {
    for (let c = boxStartCol; c < boxStartCol + boxCols; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFullGrid(size: GridSize): CellValue[][] | null {
  const grid: CellValue[][] = Array.from({ length: size }, () => Array(size).fill(null));

  function fill(pos: number): boolean {
    if (pos === size * size) return true;
    const row = Math.floor(pos / size);
    const col = pos % size;

    const nums = shuffle(Array.from({ length: size }, (_, i) => i + 1));
    for (const num of nums) {
      if (isValid(grid, row, col, num, size)) {
        grid[row][col] = num;
        if (fill(pos + 1)) return true;
        grid[row][col] = null;
      }
    }
    return false;
  }

  return fill(0) ? grid : null;
}

const CLUES_MAP: Record<GridSize, number> = {
  4: 6,
  9: 30,
  16: 100,
};

export function generateSudoku(size: GridSize): { puzzle: CellValue[][]; solution: CellValue[][] } {
  const solution = generateFullGrid(size);
  if (!solution) {
    throw new Error('Failed to generate sudoku grid');
  }

  const puzzle = solution.map((row) => [...row]);
  const totalCells = size * size;
  const cluesToKeep = CLUES_MAP[size];
  const cluesToRemove = totalCells - cluesToKeep;

  const positions = shuffle(
    Array.from({ length: totalCells }, (_, i) => i)
  );

  let removed = 0;
  for (const pos of positions) {
    if (removed >= cluesToRemove) break;
    const row = Math.floor(pos / size);
    const col = pos % size;
    puzzle[row][col] = null;
    removed++;
  }

  return { puzzle, solution };
}
