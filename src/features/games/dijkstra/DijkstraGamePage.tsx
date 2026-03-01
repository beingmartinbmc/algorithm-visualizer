import GraphCanvas from './components/GraphCanvas';
import DijkstraControls from './components/DijkstraControls';
import { useDijkstraGame } from './hooks/useDijkstraGame';

export default function DijkstraGamePage() {
  const {
    mode,
    graph,
    mapType,
    startNode,
    endNode,
    playerPath,
    playerCost,
    optimalPath,
    optimalCost,
    showOptimal,
    algoSteps,
    algoStepIndex,
    currentAlgoStep,
    isAlgoRunning,
    algoSpeed,
    setAlgoSpeed,
    score,
    timer,
    isComplete,
    lastError,
    soundEnabled,
    selectingPhase,
    clickNode,
    undoLastStep,
    stepAlgoForward,
    stepAlgoBack,
    autoPlayAlgo,
    resetGame,
    changeMode,
    newMap,
    toggleOptimal,
    toggleSound,
  } = useDijkstraGame();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <GraphCanvas
          graph={graph}
          startNode={startNode}
          endNode={endNode}
          playerPath={playerPath}
          optimalPath={optimalPath}
          showOptimal={showOptimal}
          currentAlgoStep={currentAlgoStep}
          selectingPhase={selectingPhase}
          onClickNode={clickNode}
        />
      </div>

      {/* Side panel */}
      <DijkstraControls
        mode={mode}
        mapType={mapType}
        startNode={startNode}
        endNode={endNode}
        playerPath={playerPath}
        playerCost={playerCost}
        optimalCost={optimalCost}
        showOptimal={showOptimal}
        currentAlgoStep={currentAlgoStep}
        algoStepIndex={algoStepIndex}
        algoStepsTotal={algoSteps.length}
        isAlgoRunning={isAlgoRunning}
        algoSpeed={algoSpeed}
        score={score}
        timer={timer}
        isComplete={isComplete}
        lastError={lastError}
        soundEnabled={soundEnabled}
        selectingPhase={selectingPhase}
        onChangeMode={changeMode}
        onNewMap={newMap}
        onReset={resetGame}
        onToggleOptimal={toggleOptimal}
        onUndoLastStep={undoLastStep}
        onStepForward={stepAlgoForward}
        onStepBack={stepAlgoBack}
        onAutoPlay={autoPlayAlgo}
        onSetAlgoSpeed={setAlgoSpeed}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
