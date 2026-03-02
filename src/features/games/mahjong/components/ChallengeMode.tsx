import { Trophy, Flame, Timer, CheckCircle, XCircle, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { TileCode, Suit } from '../types/mahjong';
import { SUIT_COLORS } from '../types/mahjong';
import { useMahjongChallenge } from '../hooks/useMahjongChallenge';

function ChallengeTile({ code }: { code: TileCode }) {
  const suit = code[0] as Suit;
  const value = code[1];
  const color = SUIT_COLORS[suit];
  const sym = suit === 'B' ? '竹' : suit === 'C' ? '万' : '●';

  return (
    <span className="inline-flex flex-col items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/80 w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-[4.25rem] lg:w-16 lg:h-[4.75rem]">
      <span style={{ color }} className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-none">{value}</span>
      <span className="text-[8px] md:text-[10px] text-slate-500 leading-none mt-0.5">{sym}</span>
    </span>
  );
}

export default function ChallengeMode() {
  const {
    hand, isWinning, solution, round, score, streak, bestStreak,
    timer, answered, lastCorrect, totalCorrect, totalAnswered,
    isRunning, soundEnabled,
    startGame, nextRound, answer, resetGame, toggleSound,
  } = useMahjongChallenge();

  if (!isRunning) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Challenge Mode</h2>
          <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
            You'll see a 14-tile hand. Decide as fast as you can: is it a <span className="text-emerald-400 font-semibold">Winning Hand</span> or <span className="text-red-400 font-semibold">Not a Winner</span>?
            Score points for correct answers. Faster = more bonus points. Build streaks for multipliers!
          </p>
          <button
            onClick={startGame}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-sm md:text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
          >
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Side Panel */}
      <div className="flex flex-col gap-4 w-full md:w-80 shrink-0 overflow-y-auto max-h-full pr-1">
        {/* Stats */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" />
              <div>
                <p className="text-lg md:text-xl font-bold text-white">{score}</p>
                <p className="text-[10px] md:text-xs text-slate-500">Score</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <div>
                <p className="text-lg md:text-xl font-bold text-orange-300">{streak}</p>
                <p className="text-[10px] md:text-xs text-slate-500">Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-cyan-400" />
              <div>
                <p className="text-lg md:text-xl font-bold text-cyan-300">{timer}s</p>
                <p className="text-[10px] md:text-xs text-slate-500">Time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <div>
                <p className="text-lg md:text-xl font-bold text-emerald-300">{totalCorrect}/{totalAnswered}</p>
                <p className="text-[10px] md:text-xs text-slate-500">Correct</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
            <span>Round {round}</span>
            <span>Best streak: {bestStreak}</span>
          </div>
        </div>

        {/* Answer Buttons */}
        {!answered && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Your Judgment</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => answer(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-4 text-sm md:text-base font-bold text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25 hover:scale-105 active:scale-95"
              >
                <CheckCircle size={18} /> Win
              </button>
              <button
                onClick={() => answer(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-4 text-sm md:text-base font-bold text-red-300 ring-1 ring-red-500/30 transition-all hover:bg-red-500/25 hover:scale-105 active:scale-95"
              >
                <XCircle size={18} /> Not Win
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {answered && (
          <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
            lastCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {lastCorrect
                ? <><CheckCircle size={18} className="text-emerald-400" /><span className="text-sm md:text-base font-bold text-emerald-300">Correct!</span></>
                : <><XCircle size={18} className="text-red-400" /><span className="text-sm md:text-base font-bold text-red-300">Wrong!</span></>
              }
            </div>
            <p className="text-xs md:text-sm text-slate-400 mb-3">
              The hand was <span className={`font-bold ${isWinning ? 'text-emerald-300' : 'text-red-300'}`}>
                {isWinning ? 'a Winner' : 'Not a Winner'}
              </span>.
            </p>
            {isWinning && solution && (
              <div className="text-[10px] md:text-xs text-slate-500 mb-3">
                Pair: {solution.pair.join(' ')} | Melds: {solution.melds.map((m) => m.tiles.join(' ')).join(' | ')}
              </div>
            )}
            <button
              onClick={nextRound}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500/20 px-4 py-2.5 text-xs md:text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30"
            >
              Next Round <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={resetGame} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300">
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => toggleSound(!soundEnabled)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs md:text-sm font-medium transition-all ${
              soundEnabled ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main Area — Hand */}
      <div className="order-last md:order-first flex md:flex-1 flex-col gap-4 min-h-0 md:overflow-auto">
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 md:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400">Hand to Judge</h3>
            <span className="text-xs md:text-sm font-mono font-bold text-indigo-300">Round {round}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {hand.map((code, i) => (
              <ChallengeTile key={`${code}-${i}`} code={code} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
