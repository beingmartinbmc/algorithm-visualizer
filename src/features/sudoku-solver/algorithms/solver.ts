import type { CellValue, GridSize, SolverStep } from '../types/sudoku';
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

function findEmpty(grid: CellValue[][], size: GridSize): [number, number] | null {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) return [r, c];
    }
  }
  return null;
}

function cloneGrid(grid: CellValue[][]): CellValue[][] {
  return grid.map((row) => [...row]);
}

export function solveWithSteps(inputGrid: CellValue[][], size: GridSize): SolverStep[] {
  const grid = cloneGrid(inputGrid);
  const steps: SolverStep[] = [];

  function backtrack(): boolean {
    const empty = findEmpty(grid, size);
    if (!empty) {
      steps.push({ grid: cloneGrid(grid), row: -1, col: -1, value: null, action: 'solved' });
      return true;
    }

    const [row, col] = empty;

    for (let num = 1; num <= size; num++) {
      if (isValid(grid, row, col, num, size)) {
        grid[row][col] = num;
        steps.push({ grid: cloneGrid(grid), row, col, value: num, action: 'place' });

        if (backtrack()) return true;

        grid[row][col] = null;
        steps.push({ grid: cloneGrid(grid), row, col, value: null, action: 'remove' });
      }
    }

    return false;
  }

  backtrack();
  return steps;
}

export function solveFull(inputGrid: CellValue[][], size: GridSize): CellValue[][] | null {
  const grid = cloneGrid(inputGrid);

  function backtrack(): boolean {
    const empty = findEmpty(grid, size);
    if (!empty) return true;
    const [row, col] = empty;

    for (let num = 1; num <= size; num++) {
      if (isValid(grid, row, col, num, size)) {
        grid[row][col] = num;
        if (backtrack()) return true;
        grid[row][col] = null;
      }
    }
    return false;
  }

  return backtrack() ? grid : null;
}
