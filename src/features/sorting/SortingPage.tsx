import BarChart from './components/BarChart';
import SortingControls from './components/SortingControls';
import { useSortingVisualization } from './hooks/useSortingVisualization';

export default function SortingPage() {
  const {
    algorithm,
    setAlgorithm,
    speed,
    setSpeed,
    arraySize,
    changeArraySize,
    array,
    comparing,
    swapping,
    sortedIndices,
    isRunning,
    isFinished,
    currentStep,
    totalSteps,
    soundEnabled,
    toggleSound,
    generateNewArray,
    visualize,
    stopVisualization,
  } = useSortingVisualization();

  return (
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto">
        <BarChart
          array={array}
          comparing={comparing}
          swapping={swapping}
          sortedIndices={sortedIndices}
        />
      </div>
      <SortingControls
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        speed={speed}
        setSpeed={setSpeed}
        arraySize={arraySize}
        changeArraySize={changeArraySize}
        isRunning={isRunning}
        isFinished={isFinished}
        currentStep={currentStep}
        totalSteps={totalSteps}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onVisualize={visualize}
        onStop={stopVisualization}
        onGenerateNewArray={generateNewArray}
      />
    </div>
  );
}
