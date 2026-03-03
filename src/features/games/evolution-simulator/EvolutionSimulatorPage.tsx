import { Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX } from 'lucide-react';
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
    mode,
    setMode,
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
    soundEnabled,
    toggleSound,
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
  const isGuided = mode === 'guided';
  const best = state?.bestIndividual;
  const avgFitness = state?.averageFitness ?? 0;
  const guidedTip = getGuidedTip({
    status,
    generation: state?.generation ?? 0,
    bestFitness: best?.fitness ?? 0,
    targetLength: target.length,
    convergence,
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold text-white">Evolution Simulator — Genetic Algorithm</h2>
          <p className="text-xs text-slate-400 mt-1">Evolve a population of strings toward a target using selection, crossover, and mutation.</p>

          <div className="mt-3 rounded-xl bg-indigo-500/5 ring-1 ring-indigo-500/15 px-3 py-2">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Each generation: evaluate fitness → select parents → crossover genes → mutate characters → keep the elite.
              Watch best and average fitness curves to understand convergence dynamics.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:max-w-sm">
            <button
              onClick={() => setMode('guided')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 transition-all ${
                isGuided
                  ? 'bg-amber-500/20 text-amber-300 ring-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 ring-slate-700/40 hover:bg-slate-700/60'
              }`}
            >
              Guided Mode
            </button>
            <button
              onClick={() => setMode('free-play')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 transition-all ${
                !isGuided
                  ? 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 ring-slate-700/40 hover:bg-slate-700/60'
              }`}
            >
              Free-play Mode
            </button>
          </div>
          {isGuided && (
            <p className="mt-2 text-[10px] text-amber-300/80">
              Guided mode uses recommended settings (HELLO WORLD, pop 300, mutation 3%, crossover 75%) for stable learning.
            </p>
          )}

          {isGuided && (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Guided Walkthrough</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{guidedTip.main}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                {guidedTip.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Target String</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="HELLO WORLD"
                    disabled={isGuided}
                    className="flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-cyan-500/50"
                  />
                  <button
                    onClick={randomTarget}
                    disabled={isGuided}
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
                    disabled={isGuided}
                    onChange={(e) => setPopulationSize(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700/50" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Max Generations</label>
                  <input type="number" min={1} max={20000} value={maxGenerations}
                    disabled={isGuided}
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
                  disabled={isGuided}
                  onChange={(e) => setMutationRatePercent(Number(e.target.value))}
                  className="w-full accent-rose-500" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Crossover Rate</span>
                  <span>{crossoverRatePercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={crossoverRatePercent}
                  disabled={isGuided}
                  onChange={(e) => setCrossoverRatePercent(Number(e.target.value))}
                  className="w-full accent-sky-500" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Selection Strategy</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['roulette', 'tournament'] as const).map((s) => (
                    <button key={s}
                      disabled={isGuided}
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
            <button onClick={() => toggleSound(!soundEnabled)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ring-1 ${
                soundEnabled
                  ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
                  : 'bg-slate-800/70 text-slate-400 ring-slate-700/40'
              }`}>
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
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

function getGuidedTip({
  status,
  generation,
  bestFitness,
  targetLength,
  convergence,
}: {
  status: 'idle' | 'running' | 'paused' | 'finished';
  generation: number;
  bestFitness: number;
  targetLength: number;
  convergence: number;
}) {
  if (status === 'idle') {
    return {
      main: 'Start the simulator to create the initial random population. Every individual has the same length as the target string.',
      points: [
        'Fitness = number of correct characters in correct positions.',
        'Roulette selection gives fitter strings higher chance to reproduce.',
        'Elitism keeps the best individual every generation.',
      ],
    };
  }

  if (status === 'paused') {
    return {
      main: 'Simulation is paused. Compare the best and average fitness lines before continuing.',
      points: [
        `Current convergence is ${convergence.toFixed(1)}%.`,
        'If average fitness is catching best fitness, population is stabilizing.',
        'Resume to observe further crossover + mutation effects.',
      ],
    };
  }

  if (status === 'finished') {
    const solved = targetLength > 0 && bestFitness >= targetLength;
    return {
      main: solved
        ? `Solved in ${generation} generations. The best individual now exactly matches the target.`
        : `Reached max generations at ${convergence.toFixed(1)}% convergence without full match.`,
      points: solved
        ? [
            'Notice how best fitness rose in steps when useful mutations appeared.',
            'Average fitness should trend upward as good genes spread.',
            'Try Free-play to test lower mutation or alternate selection strategy.',
          ]
        : [
            'Try increasing max generations or population size.',
            'Slightly higher mutation can help escape local plateaus.',
            'Free-play mode lets you experiment with these trade-offs.',
          ],
    };
  }

  if (generation < 10) {
    return {
      main: 'Early phase: selection pressure is starting to amplify better character matches.',
      points: [
        'Watch the best-fitness line jump when a useful mutation appears.',
        'Average fitness may rise slowly at first—this is normal.',
        'Crossover recombines partial matches from different parents.',
      ],
    };
  }

  if (convergence < 60) {
    return {
      main: 'Middle phase: the population is accumulating correct characters in more positions.',
      points: [
        'Best fitness reflects the strongest candidate so far.',
        'Average fitness indicates overall population quality.',
        'Gap between best and average shows remaining diversity.',
      ],
    };
  }

  return {
    main: 'Late phase: convergence is high; progress often comes from rare beneficial mutations.',
    points: [
      'Near the end, single-character improvements become more important.',
      'If progress stalls, Free-play can help you tune mutation and generation budget.',
      'Use Gene Comparison to see exactly which positions remain incorrect.',
    ],
  };
}
