import TileSelector from './components/TileSelector';
import HandDisplay from './components/HandDisplay';
import ResultDisplay from './components/ResultDisplay';
import MahjongControls from './components/MahjongControls';
import { useMahjong } from './hooks/useMahjong';

export default function MahjongGamePage() {
  const {
    hand,
    result,
    steps,
    stepIndex,
    stepsTotal,
    currentStep,
    isAnimating,
    animSpeed,
    showAnimation,
    lastError,
    handIsFull,
    addTile,
    removeTile,
    resetHand,
    randomHand,
    winningHand,
    checkHand,
    stepForward,
    stepBack,
    autoPlay,
    setAnimSpeed,
    toggleAnimation,
    soundEnabled,
    toggleSound,
  } = useMahjong();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Side panel */}
      <MahjongControls
        handCount={hand.length}
        handIsFull={handIsFull}
        result={result}
        showAnimation={showAnimation}
        steps={steps}
        stepIndex={stepIndex}
        stepsTotal={stepsTotal}
        isAnimating={isAnimating}
        animSpeed={animSpeed}
        currentStep={currentStep}
        lastError={lastError}
        onCheckHand={checkHand}
        onResetHand={resetHand}
        onRandomHand={randomHand}
        onWinningHand={winningHand}
        onToggleAnimation={toggleAnimation}
        onStepForward={stepForward}
        onStepBack={stepBack}
        onAutoPlay={autoPlay}
        onSetAnimSpeed={setAnimSpeed}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main area */}
      <div className="order-last md:order-first flex md:flex-1 flex-col gap-4 min-h-0 md:min-h-0 md:overflow-auto">
        <HandDisplay hand={hand} onRemoveTile={removeTile} />
        {result && <ResultDisplay result={result} />}
        <TileSelector hand={hand} handIsFull={handIsFull} onAddTile={addTile} />
      </div>
    </div>
  );
}
