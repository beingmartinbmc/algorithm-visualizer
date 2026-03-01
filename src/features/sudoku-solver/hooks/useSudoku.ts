import { useState, useCallback, useMemo } from 'react';
import type { GridSize, CellValue, SudokuGrid, SolverStep } from '../types/sudoku';
import { solveWithSteps } from '../algorithms/solver';
import { generateSudoku } from '../algorithms/generator';

function buildSudokuGrid(
  values: CellValue[][],
  original: CellValue[][],
  currentStep?: SolverStep,
  selectedCell?: { row: number; col: number } | null
): SudokuGrid {
  return values.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      isOriginal: original[r][c] !== null,
      isHighlighted: selectedCell ? selectedCell.row === r && selectedCell.col === c : false,
      isError: false,
      isCurrent: currentStep ? currentStep.row === r && currentStep.col === c : false,
    }))
  );
}

export function useSudoku() {
  const [gridSize, setGridSize] = useState<GridSize>(9);
  const [puzzleValues, setPuzzleValues] = useState<CellValue[][]>(() => {
    const { puzzle } = generateSudoku(9);
    return puzzle;
  });
  const [originalValues, setOriginalValues] = useState<CellValue[][]>(() =>
    puzzleValues.map((row) => [...row])
  );
  const [steps, setSteps] = useState<SolverStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isSolved, setIsSolved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : undefined;

  const grid: SudokuGrid = useMemo(() => {
    if (currentStep && currentStep.action !== 'solved') {
      return buildSudokuGrid(currentStep.grid, originalValues, currentStep, selectedCell);
    }
    return buildSudokuGrid(puzzleValues, originalValues, undefined, selectedCell);
  }, [puzzleValues, originalValues, currentStep, selectedCell]);

  const generate = useCallback((size: GridSize) => {
    setIsGenerating(true);
    setGridSize(size);
    setSteps([]);
    setStepIndex(-1);
    setIsSolved(false);
    setIsEditing(false);
    setSelectedCell(null);

    setTimeout(() => {
      const { puzzle } = generateSudoku(size);
      setPuzzleValues(puzzle);
      setOriginalValues(puzzle.map((row) => [...row]));
      setIsGenerating(false);
    }, 10);
  }, []);

  const startCustomPuzzle = useCallback(() => {
    const blank: CellValue[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    setPuzzleValues(blank);
    setOriginalValues(blank.map((row) => [...row]));
    setSteps([]);
    setStepIndex(-1);
    setIsSolved(false);
    setIsEditing(true);
    setSelectedCell(null);
  }, [gridSize]);

  const editCurrentPuzzle = useCallback(() => {
    setSteps([]);
    setStepIndex(-1);
    setIsSolved(false);
    setIsEditing(true);
    setSelectedCell(null);
  }, []);

  const lockCustomPuzzle = useCallback(() => {
    setOriginalValues(puzzleValues.map((row) => [...row]));
    setIsEditing(false);
    setSelectedCell(null);
    setSteps([]);
    setStepIndex(-1);
    setIsSolved(false);
  }, [puzzleValues]);

  const setCellValue = useCallback((row: number, col: number, value: CellValue) => {
    if (!isEditing) return;
    setPuzzleValues((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
  }, [isEditing]);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell((prev) =>
      prev && prev.row === row && prev.col === col ? null : { row, col }
    );
  }, []);

  const initSteps = useCallback(() => {
    if (steps.length > 0) return steps;
    const computed = solveWithSteps(originalValues, gridSize);
    setSteps(computed);
    return computed;
  }, [steps, originalValues, gridSize]);

  const nextStep = useCallback(() => {
    const allSteps = initSteps();
    if (allSteps.length === 0) return;

    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= allSteps.length) return prev;
      const step = allSteps[next];
      if (step.action === 'solved') {
        setPuzzleValues(step.grid);
        setIsSolved(true);
      } else {
        setPuzzleValues(step.grid);
      }
      return next;
    });
  }, [initSteps]);

  const prevStep = useCallback(() => {
    if (stepIndex <= 0) return;

    setStepIndex((prev) => {
      const next = prev - 1;
      if (next < 0) {
        setPuzzleValues(originalValues.map((row) => [...row]));
        return -1;
      }
      const step = steps[next];
      setPuzzleValues(step.grid);
      setIsSolved(false);
      return next;
    });
  }, [stepIndex, steps, originalValues]);

  const solveComplete = useCallback(() => {
    const allSteps = initSteps();
    if (allSteps.length === 0) return;

    const lastStep = allSteps[allSteps.length - 1];
    setPuzzleValues(lastStep.grid);
    setStepIndex(allSteps.length - 1);
    setIsSolved(lastStep.action === 'solved');
  }, [initSteps]);

  const reset = useCallback(() => {
    setPuzzleValues(originalValues.map((row) => [...row]));
    setSteps([]);
    setStepIndex(-1);
    setIsSolved(false);
    setSelectedCell(null);
  }, [originalValues]);

  const totalSteps = steps.length;
  const canGoNext = stepIndex < totalSteps - 1 || (steps.length === 0 && !isSolved);
  const canGoPrev = stepIndex > 0;

  return {
    gridSize,
    grid,
    stepIndex,
    totalSteps,
    isSolved,
    isGenerating,
    isEditing,
    selectedCell,
    canGoNext,
    canGoPrev,
    generate,
    nextStep,
    prevStep,
    solveComplete,
    reset,
    startCustomPuzzle,
    editCurrentPuzzle,
    lockCustomPuzzle,
    setCellValue,
    selectCell,
  };
}
