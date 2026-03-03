import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import FitnessChart from './components/FitnessChart';
import PopulationList from './components/PopulationList';
import GeneComparison from './components/GeneComparison';
import { useEvolutionSimulator } from './hooks/useEvolutionSimulator';

const SPEED_PRESETS = [
  { label: 'Slow', value: 120 },
  { label: 'Med', value: 35 },
  { label: 'Fast', value: 8 },
];

export default function EvolutionSimulatorPage() {
  const {
    target,
    setTarget,
    populationSize,
    setPopulationSize,
    mutationRatePercent,
    setMutationRatePercent,
    crossoverRatePercent,
    setCrossoverRatePercent,
    maxGenerations,
    setMaxGenerations,
    selectionStrategy,
    setSelectionStrategy,
    speedMs,
    setSpeedMs,
    state,
    status,
    topIndividuals,
    convergence,
    start,
    pause,
    resume,
    reset,
    randomTarget,
  } = useEvolutionSimulator();

  const isRunning = status === 'running';
  const best = state?.bestIndividual;
  const avgFitness = state?.averageFitness ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold text-white">Evolution Simulator — Genetic Algorithm</h2>
          <p className="text-xs text-slate-400 mt-1">Evolve a population of strings toward a target using selection, crossover, and mutation.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Target String</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="HELLO WORLD"
                    className="flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-cyan-500/50"
                  />
                  <button
                    onClick={randomTarget}
                    className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70"
                  >
                    <Shuffle size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Population Size</label>
                  <input type="number" min={1} max={2000} value={populationSize}
                    onChange={(e) => setPopulationSize(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700/50" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Max Generations</label>
                  <input type="number" min={1} max={20000} value={maxGenerations}
                    onChange={(e) => setMaxGenerations(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700/50" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Mutation Rate</span>
                  <span>{mutationRatePercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={mutationRatePercent}
                  onChange={(e) => setMutationRatePercent(Number(e.target.value))}
                  className="w-full accent-rose-500" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Crossover Rate</span>
                  <span>{crossoverRatePercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={crossoverRatePercent}
                  onChange={(e) => setCrossoverRatePercent(Number(e.target.value))}
                  className="w-full accent-sky-500" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Selection Strategy</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['roulette', 'tournament'] as const).map((s) => (
                    <button key={s}
                      onClick={() => setSelectionStrategy(s)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium ring-1 transition-all ${
                        selectionStrategy === s
                          ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40'
                          : 'bg-slate-800/60 text-slate-400 ring-slate-700/40 hover:bg-slate-700/60'
                      }`}
                    >
                      {s === 'roulette' ? 'Roulette Wheel' : 'Tournament'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={start}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30">
              <Play size={14} /> Start
            </button>
            <button onClick={isRunning ? pause : resume} disabled={status === 'idle' || status === 'finished'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70 disabled:opacity-40">
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70">
              <RotateCcw size={14} /> Reset
            </button>

            <div className="ml-auto inline-flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Speed</span>
              {SPEED_PRESETS.map((s) => (
                <button key={s.value} onClick={() => setSpeedMs(s.value)}
                  className={`rounded px-2 py-1 text-[10px] font-medium ${
                    speedMs === s.value ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-800/60 text-slate-400 ring-1 ring-slate-700/40'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Stat label="Generation" value={state?.generation ?? 0} />
              <Stat label="Best Fitness" value={`${best?.fitness ?? 0} / ${target.length}`} />
              <Stat label="Avg Fitness" value={avgFitness.toFixed(2)} />
              <Stat label="Convergence" value={`${convergence.toFixed(1)}%`} />
              <Stat label="Mutation" value={`${mutationRatePercent}%`} />
              <Stat label="Population" value={populationSize} />
            </div>
            <p className="mt-3 text-[11px] text-slate-400">{state?.message ?? 'Ready to evolve.'}</p>
          </div>

          <div className="lg:col-span-2">
            <GeneComparison target={target.toUpperCase()} bestGenes={best?.genes ?? ''} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <FitnessChart
              best={state?.bestFitnessHistory ?? []}
              avg={state?.averageFitnessHistory ?? []}
              targetLength={target.length}
            />
          </div>
          <PopulationList population={topIndividuals} target={target.toUpperCase()} />
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-800/50 px-2.5 py-2 ring-1 ring-slate-700/40">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-sm font-mono text-slate-100">{value}</div>
    </div>
  );
}
