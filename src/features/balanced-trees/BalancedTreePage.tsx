import BalancedTreeCanvas from './components/BalancedTreeCanvas';
import BalancedTreeControls from './components/BalancedTreeControls';
import { useBalancedTree } from './hooks/useBalancedTree';

export default function BalancedTreePage() {
  const {
    treeType,
    changeTreeType,
    displayRoot,
    highlightIds,
    description,
    steps,
    stepIndex,
    canGoNext,
    canGoPrev,
    inputValue,
    setInputValue,
    history,
    speed,
    setSpeed,
    isPlaying,
    generateRandom,
    doInsert,
    doDelete,
    nextStep,
    prevStep,
  } = useBalancedTree();

  return (
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto">
        <BalancedTreeCanvas
          root={displayRoot}
          treeType={treeType}
          highlightIds={highlightIds}
        />
      </div>
      <BalancedTreeControls
        treeType={treeType}
        changeTreeType={changeTreeType}
        inputValue={inputValue}
        setInputValue={setInputValue}
        description={description}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        history={history}
        speed={speed}
        setSpeed={setSpeed}
        isPlaying={isPlaying}
        onInsert={doInsert}
        onDelete={doDelete}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onGenerateRandom={generateRandom}
      />
    </div>
  );
}
