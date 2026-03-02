import { Trophy, RotateCcw, Equal } from 'lucide-react';
import type { AlgorithmState } from '../types/battle';
import { ALGORITHM_OPTIONS, COMPLEXITY_INFO, getWinExplanation } from '../types/battle';
import type { InputType } from '../types/battle';

interface BattleResultProps {
  stateA: AlgorithmState;
  stateB: AlgorithmState;
  winner: 'A' | 'B' | 'tie';
  prediction: 'A' | 'B' | null;
  predictionCorrect: boolean | null;
  inputType: InputType;
  onReset: () => void;
}

export default function BattleResult({
  stateA,
  stateB,
  winner,
  prediction,
  predictionCorrect,
  inputType,
  onReset,
}: BattleResultProps) {
  const nameA = ALGORITHM_OPTIONS.find((o) => o.value === stateA.algorithm)!.label;
  const nameB = ALGORITHM_OPTIONS.find((o) => o.value === stateB.algorithm)!.label;
  const compA = COMPLEXITY_INFO[stateA.algorithm];
  const compB = COMPLEXITY_INFO[stateB.algorithm];
  const explanation = getWinExplanation(winner, stateA.algorithm, stateB.algorithm, stateA.metrics, stateB.metrics, inputType);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
      {/* Winner Banner */}
      <div className="text-center">
        {winner === 'tie' ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2 ring-1 ring-amber-500/20">
            <Equal size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">It's a Tie!</span>
          </div>
        ) : (
          <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 ring-1 ${
            winner === 'A'
              ? 'bg-rose-500/10 ring-rose-500/20'
              : 'bg-cyan-500/10 ring-cyan-500/20'
          }`}>
            <Trophy size={18} className={winner === 'A' ? 'text-rose-400' : 'text-cyan-400'} />
            <span className={`text-sm font-bold ${winner === 'A' ? 'text-rose-300' : 'text-cyan-300'}`}>
              {winner === 'A' ? nameA : nameB} Wins!
            </span>
          </div>
        )}
      </div>

      {/* Prediction result */}
      {prediction && predictionCorrect !== null && (
        <div className={`rounded-lg px-4 py-2.5 text-center text-xs font-medium ${
          predictionCorrect
            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
            : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20'
        }`}>
          {predictionCorrect
            ? '🎯 Your prediction was correct!'
            : '❌ Your prediction was wrong. Keep learning!'}
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="py-2 text-left text-slate-500 font-medium">Metric</th>
              <th className="py-2 text-center text-rose-400 font-semibold">{nameA}</th>
              <th className="py-2 text-center text-cyan-400 font-semibold">{nameB}</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              { label: 'Total Steps', a: stateA.metrics.totalSteps, b: stateB.metrics.totalSteps },
              { label: 'Comparisons', a: stateA.metrics.comparisons, b: stateB.metrics.comparisons },
              { label: 'Swaps', a: stateA.metrics.swaps, b: stateB.metrics.swaps },
              { label: 'Array Accesses', a: stateA.metrics.arrayAccesses, b: stateB.metrics.arrayAccesses },
              { label: 'Time (s)', a: stateA.metrics.timeElapsed.toFixed(2), b: stateB.metrics.timeElapsed.toFixed(2) },
            ].map(({ label, a, b }) => {
              const aNum = typeof a === 'string' ? parseFloat(a) : a;
              const bNum = typeof b === 'string' ? parseFloat(b) : b;
              return (
                <tr key={label} className="border-b border-slate-800/50">
                  <td className="py-2 text-slate-400">{label}</td>
                  <td className={`py-2 text-center font-semibold ${aNum <= bNum ? 'text-emerald-300' : 'text-white'}`}>
                    {a}{aNum < bNum ? ' ✓' : ''}
                  </td>
                  <td className={`py-2 text-center font-semibold ${bNum <= aNum ? 'text-emerald-300' : 'text-white'}`}>
                    {b}{bNum < aNum ? ' ✓' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: nameA, comp: compA, color: 'rose' as const },
          { name: nameB, comp: compB, color: 'cyan' as const },
        ].map(({ name, comp, color }) => (
          <div key={name} className="rounded-lg bg-slate-800/40 p-3">
            <h4 className={`text-[10px] font-bold uppercase tracking-wider ${color === 'rose' ? 'text-rose-400' : 'text-cyan-400'} mb-2`}>
              {name}
            </h4>
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between"><span className="text-slate-500">Best</span><span className="text-slate-300">{comp.best}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Average</span><span className="text-slate-300">{comp.average}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Worst</span><span className="text-slate-300">{comp.worst}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Space</span><span className="text-slate-300">{comp.space}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="rounded-lg bg-indigo-500/5 px-4 py-3 ring-1 ring-indigo-500/15">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Why?</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{explanation}</p>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/60 px-6 py-3 text-sm font-medium text-slate-300 ring-1 ring-slate-700/50 transition-all hover:bg-slate-700/60 active:scale-[0.98]"
      >
        <RotateCcw size={14} />
        New Battle
      </button>
    </div>
  );
}
