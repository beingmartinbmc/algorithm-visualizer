import { ChevronLeft, ChevronRight, Plane, Play, Radar, Route, Shuffle, Volume2, VolumeX } from 'lucide-react';
import type { Airport, AlgorithmStep, FlightPlan, SimulationPhase, TravelAlgorithm, TravelScenario } from '../types/worldMap';
import { ALGORITHM_INFO } from '../types/worldMap';

interface Props {
  airports: Airport[];
  scenarios: TravelScenario[];
  source: string;
  destination: string;
  algorithm: TravelAlgorithm;
  plan: FlightPlan;
  currentStep: AlgorithmStep | null;
  stepIndex: number;
  totalSteps: number;
  phase: SimulationPhase;
  isPlaying: boolean;
  soundEnabled: boolean;
  onSourceChange: (code: string) => void;
  onDestinationChange: (code: string) => void;
  onAlgorithmChange: (algorithm: TravelAlgorithm) => void;
  onLoadScenario: (id: string) => void;
  onPlanRoute: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onPlay: () => void;
  onFly: () => void;
  onToggleSound: (enabled: boolean) => void;
}

const algorithms: TravelAlgorithm[] = ['dijkstra', 'astar', 'bfs', 'greedy'];

export default function WorldMapControls({
  airports,
  scenarios,
  source,
  destination,
  algorithm,
  plan,
  currentStep,
  stepIndex,
  totalSteps,
  phase,
  isPlaying,
  soundEnabled,
  onSourceChange,
  onDestinationChange,
  onAlgorithmChange,
  onLoadScenario,
  onPlanRoute,
  onStepBack,
  onStepForward,
  onPlay,
  onFly,
  onToggleSound,
}: Props) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto xl:w-88">
      <section className="rounded-2xl border border-sky-500/20 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30">
            <Plane size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">World Flight Planner</h3>
            <p className="text-[10px] text-slate-500">Airport-code simulator inspired by public airport datasets.</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Pick countries through their major airport codes, then compare how different algorithms choose routes across global hubs.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Travel Request</h3>
        <div className="grid grid-cols-2 gap-2">
          <Select label="Origin" value={source} airports={airports} onChange={onSourceChange} />
          <Select label="Destination" value={destination} airports={airports} onChange={onDestinationChange} />
        </div>
        <button onClick={onPlanRoute} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-300 ring-1 ring-sky-500/30 transition hover:bg-sky-500/25">
          <Radar size={13} /> Recalculate route
        </button>
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Algorithms</h3>
        <div className="grid gap-2">
          {algorithms.map((item) => (
            <button
              key={item}
              onClick={() => onAlgorithmChange(item)}
              className={`rounded-xl p-3 text-left transition ${algorithm === item ? 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/35' : 'bg-slate-900/70 text-slate-400 ring-1 ring-slate-800/80 hover:bg-slate-800/80'}`}
            >
              <span className="flex items-center justify-between text-xs font-bold">
                {ALGORITHM_INFO[item].label}
                <span className="text-[9px] uppercase tracking-wider opacity-60">{ALGORITHM_INFO[item].metric}</span>
              </span>
              <span className="mt-1 block text-[10px] leading-snug opacity-75">{ALGORITHM_INFO[item].description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Preset Missions</h3>
        <div className="grid gap-2">
          {scenarios.map((scenario) => (
            <button key={scenario.id} onClick={() => onLoadScenario(scenario.id)} className="rounded-xl bg-slate-900/70 p-3 text-left ring-1 ring-slate-800/80 transition hover:bg-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-200"><Shuffle size={12} /> {scenario.title}</span>
              <span className="mt-1 block text-[10px] leading-snug text-slate-500">{scenario.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flight Plan</h3>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/25">{phase}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Distance" value={`${plan.totalDistanceKm.toLocaleString()} km`} />
          <Metric label="Duration" value={`${plan.totalDurationHours}h`} />
          <Metric label="Stops" value={plan.stops.toString()} />
          <Metric label="Est. Cost" value={`$${plan.totalCostUsd.toLocaleString()}`} />
        </div>
        <div className="mt-3 rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-800/80">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Route</p>
          <div className="flex flex-wrap gap-1">
            {plan.path.map((code, index) => (
              <span key={`${code}-${index}`} className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
                {code}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Simulation</h3>
        <div className="mb-3 flex items-center justify-between text-[10px] text-slate-500">
          <span>Step</span>
          <span className="font-mono text-indigo-300">{Math.min(stepIndex + 1, totalSteps)} / {totalSteps}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={onStepBack} disabled={stepIndex <= 0} className="flex items-center justify-center gap-1 rounded-xl bg-slate-900/70 px-2 py-2 text-xs text-slate-400 ring-1 ring-slate-800/80 disabled:opacity-30">
            <ChevronLeft size={13} /> Back
          </button>
          <button onClick={onPlay} className="flex items-center justify-center gap-1 rounded-xl bg-indigo-500/15 px-2 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
            <Play size={13} /> {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={onStepForward} disabled={stepIndex >= totalSteps - 1} className="flex items-center justify-center gap-1 rounded-xl bg-slate-900/70 px-2 py-2 text-xs text-slate-400 ring-1 ring-slate-800/80 disabled:opacity-30">
            Next <ChevronRight size={13} />
          </button>
        </div>
        <button onClick={onFly} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/25">
          <Route size={13} /> Animate airplane
        </button>
        {currentStep && <p className="mt-3 text-xs leading-relaxed text-slate-400">{currentStep.description}</p>}
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Audio</h3>
        <button
          onClick={() => onToggleSound(!soundEnabled)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition ${
            soundEnabled
              ? 'bg-sky-500/15 text-sky-300 ring-sky-500/30 hover:bg-sky-500/25'
              : 'bg-slate-900/70 text-slate-400 ring-slate-800/80 hover:bg-slate-800/80'
          }`}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          Radar pings mark search steps, with takeoff, waypoint, and arrival tones during flight.
        </p>
      </section>
    </aside>
  );
}

function Select({ label, value, airports, onChange }: { label: string; value: string; airports: Airport[]; onChange: (code: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 outline-none ring-sky-500/20 focus:ring-2">
        {airports.map((airport) => (
          <option key={airport.code} value={airport.code}>
            {airport.code} - {airport.city}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/70 p-3 ring-1 ring-slate-800/80">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-sm font-black text-white">{value}</div>
    </div>
  );
}
