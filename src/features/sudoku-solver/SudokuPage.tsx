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
    evaluationResult,
    evaluate,
  } = useSudoku();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      <div className="order-last md:order-first flex md:flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] md:min-h-0 max-h-[50vh] md:max-h-none overflow-auto">
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
        evaluationResult={evaluationResult}
        onGenerate={generate}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onSolveComplete={solveComplete}
        onEvaluate={evaluate}
        onReset={reset}
        onStartCustom={startCustomPuzzle}
        onEditCurrent={editCurrentPuzzle}
        onLockCustom={lockCustomPuzzle}
      />
    </div>
  );
}
