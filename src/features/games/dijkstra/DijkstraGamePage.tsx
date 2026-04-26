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

  const routeLabel = startNode && endNode ? `${startNode} -> ${endNode}` : 'Select depot and destination';

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_28%)]">
      <div className="border-b border-slate-800/70 bg-slate-950/75 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400">Shortest Path Command Center</p>
            <h2 className="text-lg font-bold text-white">Dijkstra Delivery Simulator</h2>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <HeaderChip label="Mode" value={mode} tone="indigo" />
            <HeaderChip label="Map" value={mapType} tone="sky" />
            <HeaderChip label="Route" value={routeLabel} tone="emerald" />
            {isComplete && <HeaderChip label="Result" value={playerCost === optimalCost ? 'optimal' : `+${playerCost - optimalCost} min`} tone={playerCost === optimalCost ? 'emerald' : 'amber'} />}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 xl:flex-row">
        {/* Main area */}
        <div className="order-last flex min-h-[620px] flex-1 flex-col gap-4 xl:order-first xl:min-h-0">
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
    </div>
  );
}

function HeaderChip({ label, value, tone }: { label: string; value: string; tone: 'indigo' | 'sky' | 'emerald' | 'amber' }) {
  const tones = {
    indigo: 'bg-indigo-500/10 text-indigo-200 ring-indigo-500/25',
    sky: 'bg-sky-500/10 text-sky-200 ring-sky-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-200 ring-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-200 ring-amber-500/25',
  };
  return (
    <div className={`rounded-full px-3 py-1.5 text-[10px] ring-1 ${tones[tone]}`}>
      <span className="mr-1 uppercase tracking-wider opacity-60">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}
