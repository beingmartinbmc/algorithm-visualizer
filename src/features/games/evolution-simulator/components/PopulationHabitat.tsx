import type { Individual } from '../engine';

interface PopulationHabitatProps {
  population: Individual[];
  target: string;
  generation: number;
  convergence: number;
  status: 'idle' | 'running' | 'paused' | 'finished';
}

const SKIN_TONES = ['#f8c9a5', '#d99b6c', '#8d5524', '#f1b982', '#c68642'];
const SHIRT_COLORS = ['#22c55e', '#38bdf8', '#a78bfa', '#fb7185', '#facc15', '#2dd4bf'];

export default function PopulationHabitat({
  population,
  target,
  generation,
  convergence,
  status,
}: PopulationHabitatProps) {
  const displayPopulation = population.length > 0
    ? population.slice(0, 12)
    : Array.from({ length: 12 }, (_, index) => ({
        genes: '????',
        fitness: Math.max(0, 12 - index),
      }));
  const targetLength = Math.max(1, target.length);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-700/30 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,59,0.42))] p-4 shadow-2xl shadow-black/30 md:p-5">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-950/50 to-transparent" />
      <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-bold text-white md:text-lg">Population Habitat</h3>
          <p className="mt-1 text-xs leading-relaxed text-emerald-100/65">
            Each person is a candidate solution. Brighter badges mean more matching genes survived selection.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Badge label="Gen" value={generation} />
          <Badge label="Fit" value={`${convergence.toFixed(0)}%`} />
          <Badge label="State" value={status} />
        </div>
      </div>

      <div className="relative z-10 mt-5 rounded-2xl border border-emerald-950/50 bg-emerald-950/25 p-4 shadow-inner">
        <div className="absolute inset-x-6 bottom-3 h-10 rounded-[50%] bg-black/20 blur-xl" />
        <div className="relative grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
          {displayPopulation.map((individual, index) => {
            const fitnessRatio = individual.fitness / targetLength;
            const isElite = index === 0 && population.length > 0;
            return (
              <Person
                key={`${individual.genes}-${index}`}
                rank={index + 1}
                genes={individual.genes}
                fitnessRatio={fitnessRatio}
                isElite={isElite}
                skin={SKIN_TONES[index % SKIN_TONES.length]}
                shirt={SHIRT_COLORS[index % SHIRT_COLORS.length]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Person({
  rank,
  genes,
  fitnessRatio,
  isElite,
  skin,
  shirt,
}: {
  rank: number;
  genes: string;
  fitnessRatio: number;
  isElite: boolean;
  skin: string;
  shirt: string;
}) {
  const clamped = Math.max(0, Math.min(1, fitnessRatio));
  const aura = isElite ? 'shadow-[0_0_26px_rgba(52,211,153,0.45)]' : '';
  const opacity = 0.4 + clamped * 0.6;

  return (
    <div className={`group relative flex flex-col items-center rounded-2xl border px-2 py-3 transition-all hover:-translate-y-1 ${
      isElite
        ? 'border-emerald-300/50 bg-emerald-400/10'
        : 'border-emerald-900/30 bg-slate-950/25'
    } ${aura}`}>
      <div className="absolute right-1.5 top-1.5 rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 ring-1 ring-slate-700/50">
        #{rank}
      </div>
      <div className="relative mt-2">
        <div
          className="h-9 w-9 rounded-full border border-black/15 shadow-inner"
          style={{ backgroundColor: skin, opacity }}
        >
          <div className="mx-auto mt-3 flex w-4 justify-between">
            <span className="h-1 w-1 rounded-full bg-slate-950/70" />
            <span className="h-1 w-1 rounded-full bg-slate-950/70" />
          </div>
          <div className="mx-auto mt-1 h-1 w-3 rounded-full bg-slate-950/40" />
        </div>
        <div
          className="mx-auto -mt-1 h-10 w-12 rounded-t-2xl rounded-b-lg border border-black/15 shadow-lg"
          style={{ backgroundColor: shirt, opacity }}
        />
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-950/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      <div className="mt-1 max-w-full truncate font-mono text-[9px] text-emerald-100/70">
        {genes || 'waiting'}
      </div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-950/45 px-3 py-2 ring-1 ring-emerald-500/20">
      <div className="text-[9px] uppercase tracking-wider text-emerald-100/45">{label}</div>
      <div className="mt-0.5 text-xs font-bold capitalize text-emerald-100">{value}</div>
    </div>
  );
}
