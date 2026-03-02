import { useState } from 'react';
import { Swords, ArrowLeft, BarChart3, Map, GitBranch } from 'lucide-react';
import BattleSetup from './components/BattleSetup';
import BattleArena from './components/BattleArena';
import PathfindingArena from './components/PathfindingArena';
import RecursionArena from './components/RecursionArena';
import { useBattle } from './hooks/useBattle';
import { usePathfindingBattle } from './hooks/usePathfindingBattle';
import { useRecursionBattle } from './hooks/useRecursionBattle';
import type { BattleCategory } from './types/battle';
import { PF_ALGORITHM_OPTIONS } from './engine/pathfindingEngine';
import { REC_ALGORITHM_OPTIONS } from './engine/recursionEngine';
import type { GameMode } from './types/battle';
import { SPEED_PRESETS } from './types/battle';

const categories: { value: BattleCategory; label: string; desc: string; icon: typeof BarChart3 }[] = [
  { value: 'sorting', label: 'Sorting', desc: 'Bubble, Quick, Merge & more', icon: BarChart3 },
  { value: 'pathfinding', label: 'Pathfinding', desc: 'BFS, DFS, Dijkstra, A*', icon: Map },
  { value: 'recursion', label: 'Recursion', desc: 'Naive vs Memoized Fibonacci', icon: GitBranch },
];

function CategoryPicker({ onSelect }: { onSelect: (c: BattleCategory) => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center justify-center px-6 pt-10 pb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 ring-1 ring-rose-500/20">
          <Swords size={14} className="text-rose-400" />
          <span className="text-xs font-medium text-rose-300">Algorithm Battles</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Choose Your <span className="bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">Arena</span>
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">Pick a battle category to pit two algorithms head-to-head.</p>
      </section>
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-lg grid grid-cols-1 gap-3">
          {categories.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className="group flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 text-left backdrop-blur-sm transition-all hover:border-slate-600/60 hover:bg-slate-900/80 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-cyan-500/20 ring-1 ring-white/10">
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{label} Battles</h3>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───── Pathfinding Setup ───── */
function PathfindingSetup({ battle }: { battle: ReturnType<typeof usePathfindingBattle> }) {
  const nameA = PF_ALGORITHM_OPTIONS.find((o) => o.value === battle.algorithmA)!.label;
  const nameB = PF_ALGORITHM_OPTIONS.find((o) => o.value === battle.algorithmB)!.label;

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
        <h2 className="text-2xl font-extrabold text-white">
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">{nameA}</span>
          {' '}vs{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{nameB}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Race to find a path on the same random grid</p>
      </section>
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['A', 'B'] as const).map((side) => (
              <div key={side} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${side === 'A' ? 'text-rose-400' : 'text-cyan-400'} mb-3`}>Algorithm {side}</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {PF_ALGORITHM_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => side === 'A' ? battle.setAlgorithmA(opt.value) : battle.setAlgorithmB(opt.value)}
                      className={`rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${
                        (side === 'A' ? battle.algorithmA : battle.algorithmB) === opt.value
                          ? side === 'A' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <GameModeAndSpeed gameMode={battle.gameMode} setGameMode={battle.setGameMode} speed={battle.speed} setSpeed={battle.setSpeed}
            soundEnabled={battle.soundEnabled} toggleSound={battle.toggleSound} prediction={battle.prediction} setPrediction={battle.setPrediction}
            nameA={nameA} nameB={nameB} />
          <button onClick={battle.startBattle}
            disabled={battle.gameMode === 'prediction' && !battle.prediction}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-cyan-500/20 px-6 py-4 text-base font-bold text-white ring-1 ring-white/10 transition-all hover:from-rose-500/30 hover:to-cyan-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            <Map size={18} className="text-rose-300" /> Start Battle
          </button>
        </div>
      </section>
    </div>
  );
}

/* ───── Recursion Setup ───── */
function RecursionSetup({ battle }: { battle: ReturnType<typeof useRecursionBattle> }) {
  const nameA = REC_ALGORITHM_OPTIONS.find((o) => o.value === battle.algorithmA)!.label;
  const nameB = REC_ALGORITHM_OPTIONS.find((o) => o.value === battle.algorithmB)!.label;

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
        <h2 className="text-2xl font-extrabold text-white">
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">{nameA}</span>
          {' '}vs{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{nameB}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Compare Fibonacci implementations</p>
      </section>
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['A', 'B'] as const).map((side) => (
              <div key={side} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${side === 'A' ? 'text-rose-400' : 'text-cyan-400'} mb-3`}>Algorithm {side}</h3>
                <div className="space-y-1.5">
                  {REC_ALGORITHM_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => side === 'A' ? battle.setAlgorithmA(opt.value) : battle.setAlgorithmB(opt.value)}
                      className={`w-full rounded-lg px-3 py-2 text-[11px] font-medium transition-all text-left ${
                        (side === 'A' ? battle.algorithmA : battle.algorithmB) === opt.value
                          ? side === 'A' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Input</h3>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Fibonacci N</span>
              <span className="text-sm font-mono font-bold text-indigo-300">{battle.inputN}</span>
            </div>
            <input type="range" min={5} max={25} value={battle.inputN}
              onChange={(e) => battle.setInputN(Number(e.target.value))}
              className="w-full accent-indigo-500" />
            <p className="text-[10px] text-slate-500 mt-1">⚠️ Naive recursive is exponential — N &gt; 20 generates many steps</p>
          </div>
          <GameModeAndSpeed gameMode={battle.gameMode} setGameMode={battle.setGameMode} speed={battle.speed} setSpeed={battle.setSpeed}
            soundEnabled={battle.soundEnabled} toggleSound={battle.toggleSound} prediction={battle.prediction} setPrediction={battle.setPrediction}
            nameA={nameA} nameB={nameB} />
          <button onClick={battle.startBattle}
            disabled={battle.gameMode === 'prediction' && !battle.prediction}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-cyan-500/20 px-6 py-4 text-base font-bold text-white ring-1 ring-white/10 transition-all hover:from-rose-500/30 hover:to-cyan-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            <GitBranch size={18} className="text-rose-300" /> Start Battle
          </button>
        </div>
      </section>
    </div>
  );
}

/* ───── Shared Game Mode + Speed picker ───── */
function GameModeAndSpeed({ gameMode, setGameMode, speed, setSpeed, soundEnabled, toggleSound, prediction, setPrediction, nameA, nameB }: {
  gameMode: GameMode; setGameMode: (m: GameMode) => void;
  speed: number; setSpeed: (s: number) => void;
  soundEnabled: boolean; toggleSound: (v: boolean) => void;
  prediction: 'A' | 'B' | null; setPrediction: (p: 'A' | 'B' | null) => void;
  nameA: string; nameB: string;
}) {
  const modes: { value: GameMode; label: string }[] = [
    { value: 'realtime', label: 'Real-Time' },
    { value: 'turbo', label: 'Turbo' },
    { value: 'prediction', label: 'Prediction' },
  ];
  return (
    <>
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Game Mode</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((m) => (
            <button key={m.value} onClick={() => setGameMode(m.value)}
              className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-all ${gameMode === m.value ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {gameMode === 'prediction' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">Your Prediction</h3>
          <div className="flex gap-2">
            <button onClick={() => setPrediction('A')}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${prediction === 'A' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>{nameA}</button>
            <button onClick={() => setPrediction('B')}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${prediction === 'B' ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>{nameB}</button>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Speed</h3>
          <div className="flex gap-1.5">
            {SPEED_PRESETS.map((s) => (
              <button key={s.value} onClick={() => setSpeed(s.value)}
                className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all ${speed === s.value ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => toggleSound(!soundEnabled)}
          className={`shrink-0 flex flex-col items-center justify-center rounded-xl px-4 transition-all ${soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/60 text-slate-500 ring-1 ring-slate-700/40'}`}>
          {soundEnabled ? '🔊' : '🔇'}
          <span className="text-[10px] mt-1">{soundEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>
    </>
  );
}

/* ───── Main Page ───── */
export default function BattlePage() {
  const [category, setCategory] = useState<BattleCategory | null>(null);
  const sorting = useBattle();
  const pathfinding = usePathfindingBattle();
  const recursion = useRecursionBattle();

  const goBack = () => {
    sorting.reset();
    pathfinding.reset();
    recursion.reset();
    setCategory(null);
  };

  if (!category) return <CategoryPicker onSelect={setCategory} />;

  const backButton = (
    <button onClick={goBack}
      className="fixed top-16 left-4 z-10 flex items-center gap-1 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-400 ring-1 ring-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 hover:text-slate-300">
      <ArrowLeft size={12} /> Back
    </button>
  );

  /* ── Sorting ── */
  if (category === 'sorting') {
    if (sorting.status === 'setup') {
      return <>{backButton}<BattleSetup
        algorithmA={sorting.algorithmA} algorithmB={sorting.algorithmB}
        inputSize={sorting.inputSize} inputType={sorting.inputType}
        gameMode={sorting.gameMode} speed={sorting.speed}
        soundEnabled={sorting.soundEnabled} prediction={sorting.prediction}
        onSetAlgorithmA={sorting.setAlgorithmA} onSetAlgorithmB={sorting.setAlgorithmB}
        onSetInputSize={sorting.setInputSize} onSetInputType={sorting.setInputType}
        onSetGameMode={sorting.setGameMode} onSetSpeed={sorting.setSpeed}
        onToggleSound={sorting.toggleSound} onSetPrediction={sorting.setPrediction}
        onStart={sorting.startBattle}
      /></>;
    }
    if (sorting.stateA && sorting.stateB) {
      return <>{backButton}<BattleArena
        stateA={sorting.stateA} stateB={sorting.stateB}
        status={sorting.status as 'running' | 'paused' | 'finished'}
        winner={sorting.winner} prediction={sorting.prediction}
        predictionCorrect={sorting.predictionCorrect} inputType={sorting.inputType}
        speed={sorting.speed} soundEnabled={sorting.soundEnabled}
        metricsHistory={sorting.metricsHistory}
        onPause={sorting.pause} onResume={sorting.resume} onReset={sorting.reset}
        onSetSpeed={sorting.setSpeed} onToggleSound={sorting.toggleSound}
      /></>;
    }
  }

  /* ── Pathfinding ── */
  if (category === 'pathfinding') {
    if (pathfinding.status === 'setup') {
      return <>{backButton}<PathfindingSetup battle={pathfinding} /></>;
    }
    if (pathfinding.stateA && pathfinding.stateB && pathfinding.grid) {
      return <>{backButton}<PathfindingArena
        grid={pathfinding.grid}
        stateA={pathfinding.stateA} stateB={pathfinding.stateB}
        status={pathfinding.status as 'running' | 'paused' | 'finished'}
        winner={pathfinding.winner} prediction={pathfinding.prediction}
        predictionCorrect={pathfinding.predictionCorrect}
        speed={pathfinding.speed} soundEnabled={pathfinding.soundEnabled}
        onPause={pathfinding.pause} onResume={pathfinding.resume} onReset={pathfinding.reset}
        onSetSpeed={pathfinding.setSpeed} onToggleSound={pathfinding.toggleSound}
      /></>;
    }
  }

  /* ── Recursion ── */
  if (category === 'recursion') {
    if (recursion.status === 'setup') {
      return <>{backButton}<RecursionSetup battle={recursion} /></>;
    }
    if (recursion.stateA && recursion.stateB) {
      return <>{backButton}<RecursionArena
        stateA={recursion.stateA} stateB={recursion.stateB}
        status={recursion.status as 'running' | 'paused' | 'finished'}
        winner={recursion.winner} prediction={recursion.prediction}
        predictionCorrect={recursion.predictionCorrect}
        speed={recursion.speed} soundEnabled={recursion.soundEnabled}
        onPause={recursion.pause} onResume={recursion.resume} onReset={recursion.reset}
        onSetSpeed={recursion.setSpeed} onToggleSound={recursion.toggleSound}
      /></>;
    }
  }

  return null;
}
