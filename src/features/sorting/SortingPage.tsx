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
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      <div className="flex md:flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] md:min-h-0 max-h-[50vh] md:max-h-none overflow-auto">
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
