import TreeCanvas from './components/TreeCanvas';
import TraversalControls from './components/TraversalControls';
import { useTreeTraversal } from './hooks/useTreeTraversal';

export default function TreeTraversalPage() {
  const {
    traversalType,
    setTraversalType,
    nodeCount,
    root,
    stepIndex,
    totalSteps,
    visitedIds,
    processedIds,
    currentId,
    processOrder,
    isPlaying,
    isFinished,
    speed,
    setSpeed,
    soundEnabled,
    toggleSound,
    canGoNext,
    canGoPrev,
    generateNew,
    nextStep,
    prevStep,
    play,
    stopPlaying,
    reset,
  } = useTreeTraversal();

  return (
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto">
        <TreeCanvas
          root={root}
          visitedIds={visitedIds}
          processedIds={processedIds}
          currentId={currentId}
          processOrder={processOrder}
        />
      </div>
      <TraversalControls
        traversalType={traversalType}
        setTraversalType={setTraversalType}
        nodeCount={nodeCount}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        processOrder={processOrder}
        isPlaying={isPlaying}
        isFinished={isFinished}
        speed={speed}
        setSpeed={setSpeed}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onGenerate={generateNew}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onPlay={play}
        onStop={stopPlaying}
        onReset={reset}
      />
    </div>
  );
}
