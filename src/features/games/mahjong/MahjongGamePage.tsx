import { useState } from 'react';
import type { MahjongGameMode } from './types/mahjong';
import { MODE_INFO } from './types/mahjong';
import { BookOpen, Zap, Users, Wrench } from 'lucide-react';
import TileSelector from './components/TileSelector';
import HandDisplay from './components/HandDisplay';
import ResultDisplay from './components/ResultDisplay';
import MahjongControls from './components/MahjongControls';
import GuidedMode from './components/GuidedMode';
import ChallengeMode from './components/ChallengeMode';
import TwoPlayerMode from './components/TwoPlayerMode';
import { useMahjong } from './hooks/useMahjong';

const MODE_ICONS: Record<MahjongGameMode, React.ReactNode> = {
  sandbox: <Wrench size={14} />,
  guided: <BookOpen size={14} />,
  challenge: <Zap size={14} />,
  'two-player': <Users size={14} />,
};

const MODES: MahjongGameMode[] = ['sandbox', 'guided', 'challenge', 'two-player'];

function SandboxMode() {
  const {
    hand, result, steps, stepIndex, stepsTotal, currentStep,
    isAnimating, animSpeed, showAnimation, lastError, handIsFull,
    addTile, removeTile, resetHand, randomHand, winningHand, checkHand,
    stepForward, stepBack, autoPlay, setAnimSpeed, toggleAnimation,
    soundEnabled, toggleSound,
  } = useMahjong();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
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
      <div className="order-last md:order-first flex md:flex-1 flex-col gap-4 min-h-0 md:min-h-0 md:overflow-auto">
        <HandDisplay hand={hand} onRemoveTile={removeTile} />
        {result && <ResultDisplay result={result} />}
        <TileSelector hand={hand} handIsFull={handIsFull} onAddTile={addTile} />
      </div>
    </div>
  );
}

export default function MahjongGamePage() {
  const [mode, setMode] = useState<MahjongGameMode>('sandbox');

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Mode Tabs */}
      <div className="shrink-0 border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-sm px-4 md:px-6 pt-3 pb-0">
        <div className="flex gap-1 overflow-x-auto">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                mode === m
                  ? 'bg-slate-800/80 text-indigo-300 border border-b-0 border-slate-700/50 -mb-px'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {MODE_ICONS[m]}
              <span>{MODE_INFO[m].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Content */}
      <div className="flex flex-1 overflow-hidden">
        {mode === 'sandbox' && <SandboxMode />}
        {mode === 'guided' && <GuidedMode />}
        {mode === 'challenge' && <ChallengeMode />}
        {mode === 'two-player' && <TwoPlayerMode />}
      </div>
    </div>
  );
}
