import Grid from './components/Grid/Grid';
import Controls from './components/Controls/Controls';
import Legend from './components/Controls/Legend';
import { useGrid } from './hooks/useGrid';
import { useVisualization } from './hooks/useVisualization';

export default function GraphTraversalPage() {
  const {
    grid,
    startPos,
    endPos,
    isDrawing,
    drawMode,
    setDrawMode,
    setIsDrawing,
    resetGrid,
    clearVisualization,
    handleNodeInteraction,
    setNodeType,
    generateMaze,
  } = useGrid();

  const {
    algorithm,
    setAlgorithm,
    speed,
    setSpeed,
    isRunning,
    isFinished,
    visitedCount,
    pathLength,
    soundEnabled,
    toggleSound,
    visualize,
    stopVisualization,
  } = useVisualization({ grid, startPos, endPos, setNodeType, clearVisualization });

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      <div className="flex md:flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] md:min-h-0 max-h-[50vh] md:max-h-none overflow-auto">
        <Grid
          grid={grid}
          isRunning={isRunning}
          isDrawing={isDrawing}
          drawMode={drawMode}
          setIsDrawing={setIsDrawing}
          handleNodeInteraction={handleNodeInteraction}
        />
        <Legend />
      </div>
      <Controls
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        speed={speed}
        setSpeed={setSpeed}
        drawMode={drawMode}
        setDrawMode={setDrawMode}
        isRunning={isRunning}
        isFinished={isFinished}
        visitedCount={visitedCount}
        pathLength={pathLength}
        onVisualize={visualize}
        onStop={stopVisualization}
        onReset={resetGrid}
        onClearVisualization={clearVisualization}
        onGenerateMaze={generateMaze}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
