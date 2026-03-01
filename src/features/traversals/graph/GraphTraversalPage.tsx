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
    <div className="flex flex-1 gap-6 overflow-hidden p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto">
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
