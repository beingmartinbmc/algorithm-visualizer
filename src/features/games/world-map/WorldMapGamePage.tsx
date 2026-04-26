import WorldMapCanvas from './components/WorldMapCanvas';
import WorldMapControls from './components/WorldMapControls';
import { useWorldMapSimulator } from './hooks/useWorldMapSimulator';
import { ALGORITHM_INFO } from './types/worldMap';

export default function WorldMapGamePage() {
  const simulator = useWorldMapSimulator();

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]">
      <div className="border-b border-slate-800/70 bg-slate-950/75 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400">Airport Network Algorithms</p>
            <h2 className="text-lg font-bold text-white">World Map Flight Simulator</h2>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <HeaderChip label="Algorithm" value={ALGORITHM_INFO[simulator.algorithm].label} tone="indigo" />
            <HeaderChip label="Origin" value={simulator.source} tone="sky" />
            <HeaderChip label="Destination" value={simulator.destination} tone="emerald" />
            <HeaderChip label="Stops" value={simulator.result.plan.stops.toString()} tone="amber" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 xl:flex-row">
        <WorldMapCanvas
          airports={simulator.airports}
          routes={simulator.routes}
          source={simulator.source}
          destination={simulator.destination}
          currentStep={simulator.currentStep}
          plan={simulator.result.plan}
          flightProgress={simulator.flightProgress}
          onSelectSource={simulator.changeSource}
          onSelectDestination={simulator.changeDestination}
        />
        <WorldMapControls
          airports={simulator.airports}
          scenarios={simulator.scenarios}
          source={simulator.source}
          destination={simulator.destination}
          algorithm={simulator.algorithm}
          plan={simulator.result.plan}
          currentStep={simulator.currentStep}
          stepIndex={simulator.stepIndex}
          totalSteps={simulator.result.steps.length}
          phase={simulator.phase}
          isPlaying={simulator.isPlaying}
          onSourceChange={simulator.changeSource}
          onDestinationChange={simulator.changeDestination}
          onAlgorithmChange={simulator.changeAlgorithm}
          onLoadScenario={simulator.loadScenario}
          onPlanRoute={() => simulator.planRoute()}
          onStepBack={simulator.stepBack}
          onStepForward={simulator.stepForward}
          onPlay={simulator.playPlanning}
          onFly={simulator.animateFlight}
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
