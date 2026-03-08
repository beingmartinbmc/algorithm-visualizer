import type { ChallengeResult, Move } from '../engine/types';
import { Trophy, Clock, Zap, Target, RotateCcw } from 'lucide-react';

interface ChallengePanelProps {
  result: ChallengeResult | null;
  userMoves: Move[];
  startTime: number | null;
  onNewChallenge: () => void;
  scrambleMoves: Move[];
}

export default function ChallengePanel({
  result, userMoves, startTime, onNewChallenge, scrambleMoves,
}: ChallengePanelProps) {
  const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Trophy size={12} className="text-amber-400" /> Challenge Mode
      </h3>

      {/* Scramble info */}
      <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3 space-y-2">
        <div className="text-[10px] text-slate-500 uppercase font-semibold">Scramble ({scrambleMoves.length} moves)</div>
        <div className="flex flex-wrap gap-1">
          {scrambleMoves.map((m, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-700/60 text-[10px] font-mono text-slate-400">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-2.5 text-center">
          <Clock size={14} className="mx-auto text-cyan-400 mb-1" />
          <div className="text-lg font-bold text-white font-mono">{result ? result.timeSeconds.toFixed(1) : elapsed}s</div>
          <div className="text-[10px] text-slate-500">Time</div>
        </div>
        <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-2.5 text-center">
          <Zap size={14} className="mx-auto text-amber-400 mb-1" />
          <div className="text-lg font-bold text-white font-mono">{result ? result.userMoves : userMoves.length}</div>
          <div className="text-[10px] text-slate-500">Your Moves</div>
        </div>
      </div>

      {/* Move history */}
      {userMoves.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Your Moves</div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {userMoves.map((m, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-[10px] font-mono text-cyan-400">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-lg border p-4 text-center space-y-2 ${
          result.solved
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex justify-center">
            {result.solved ? (
              <Trophy size={28} className="text-amber-400" />
            ) : (
              <Target size={28} className="text-red-400" />
            )}
          </div>
          <h4 className={`text-sm font-bold ${result.solved ? 'text-emerald-400' : 'text-red-400'}`}>
            {result.solved ? '🎉 Cube Solved!' : 'Keep Trying!'}
          </h4>
          {result.solved && (
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p>Time: <span className="text-white font-bold">{result.timeSeconds.toFixed(1)}s</span></p>
              <p>Your moves: <span className="text-white font-bold">{result.userMoves}</span></p>
              <p>Optimal: <span className="text-cyan-400 font-bold">~{result.optimalMoves}</span></p>
              <p>Efficiency: <span className="text-amber-400 font-bold">
                {result.optimalMoves > 0 ? Math.round((result.optimalMoves / result.userMoves) * 100) : 100}%
              </span></p>
            </div>
          )}
        </div>
      )}

      {/* New challenge button */}
      <button
        onClick={onNewChallenge}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
          bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500
          text-white text-xs font-semibold transition-all"
      >
        <RotateCcw size={12} /> New Challenge
      </button>
    </div>
  );
}
