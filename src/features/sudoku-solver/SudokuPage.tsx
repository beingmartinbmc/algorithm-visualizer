import SudokuGridComponent from './components/SudokuGrid';
import SudokuControls from './components/SudokuControls';
import { useSudoku } from './hooks/useSudoku';

export default function SudokuPage() {
  const {
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
  } = useSudoku();

  return (
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto">
        <SudokuGridComponent
          grid={grid}
          gridSize={gridSize}
          isEditing={isEditing}
          selectedCell={selectedCell}
          onCellClick={selectCell}
          onCellValueChange={setCellValue}
        />
        {isEditing && (
          <p className="text-xs text-amber-300/60 animate-pulse">
            Editing mode — click cells and type numbers
          </p>
        )}
      </div>
      <SudokuControls
        gridSize={gridSize}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        isSolved={isSolved}
        isGenerating={isGenerating}
        isEditing={isEditing}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onGenerate={generate}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onSolveComplete={solveComplete}
        onReset={reset}
        onStartCustom={startCustomPuzzle}
        onEditCurrent={editCurrentPuzzle}
        onLockCustom={lockCustomPuzzle}
      />
    </div>
  );
}
