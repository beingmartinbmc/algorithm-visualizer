import BattleSetup from './components/BattleSetup';
import BattleArena from './components/BattleArena';
import { useBattle } from './hooks/useBattle';

export default function BattlePage() {
  const {
    algorithmA, setAlgorithmA,
    algorithmB, setAlgorithmB,
    inputSize, setInputSize,
    inputType, setInputType,
    gameMode, setGameMode,
    speed, setSpeed,
    status,
    soundEnabled, toggleSound,
    stateA, stateB,
    winner,
    prediction, setPrediction,
    predictionCorrect,
    metricsHistory,
    startBattle,
    pause,
    resume,
    reset,
  } = useBattle();

  if (status === 'setup') {
    return (
      <BattleSetup
        algorithmA={algorithmA}
        algorithmB={algorithmB}
        inputSize={inputSize}
        inputType={inputType}
        gameMode={gameMode}
        speed={speed}
        soundEnabled={soundEnabled}
        prediction={prediction}
        onSetAlgorithmA={setAlgorithmA}
        onSetAlgorithmB={setAlgorithmB}
        onSetInputSize={setInputSize}
        onSetInputType={setInputType}
        onSetGameMode={setGameMode}
        onSetSpeed={setSpeed}
        onToggleSound={toggleSound}
        onSetPrediction={setPrediction}
        onStart={startBattle}
      />
    );
  }

  if (stateA && stateB) {
    return (
      <BattleArena
        stateA={stateA}
        stateB={stateB}
        status={status as 'running' | 'paused' | 'finished'}
        winner={winner}
        prediction={prediction}
        predictionCorrect={predictionCorrect}
        inputType={inputType}
        speed={speed}
        soundEnabled={soundEnabled}
        metricsHistory={metricsHistory}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onSetSpeed={setSpeed}
        onToggleSound={toggleSound}
      />
    );
  }

  return null;
}
