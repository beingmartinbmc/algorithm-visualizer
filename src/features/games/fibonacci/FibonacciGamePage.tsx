import SpiralCanvas from './components/SpiralCanvas';
import BlockTray from './components/BlockTray';
import GameControls from './components/GameControls';
import EducationalPanel from './components/EducationalPanel';
import { useFibonacciGame } from './hooks/useFibonacciGame';

export default function FibonacciGamePage() {
  const {
    mode,
    sequence,
    placedSquares,
    score,
    streak,
    timer,
    isComplete,
    lastError,
    showHint,
    expectedNext,
    availableBlocks,
    lastPlacedId,
    shakeBlockId,
    soundEnabled,
    changeMode,
    placeBlock,
    resetGame,
    toggleHint,
    toggleSound,
  } = useFibonacciGame();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Main area */}
      <div className="flex md:flex-1 flex-col gap-4 min-h-0 max-h-[60vh] md:max-h-none overflow-auto">
        <div className="flex-1 flex flex-col min-h-0">
          <SpiralCanvas
            placedSquares={placedSquares}
            lastPlacedId={lastPlacedId}
          />
        </div>
        <BlockTray
          blocks={availableBlocks}
          lastError={lastError}
          shakeBlockId={shakeBlockId}
          isComplete={isComplete}
          onPlaceBlock={placeBlock}
        />
        <EducationalPanel sequence={sequence} />
      </div>

      {/* Side panel */}
      <GameControls
        mode={mode}
        score={score}
        streak={streak}
        timer={timer}
        isComplete={isComplete}
        showHint={showHint}
        sequence={sequence}
        expectedNext={expectedNext}
        soundEnabled={soundEnabled}
        onChangeMode={changeMode}
        onReset={resetGame}
        onToggleHint={toggleHint}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
