import { CheckCircle, XCircle, ArrowRight, RotateCcw, Lightbulb, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { TileCode, Suit } from '../types/mahjong';
import { SUIT_COLORS } from '../types/mahjong';
import { useMahjongGuided } from '../hooks/useMahjongGuided';

function GuidedTile({ code, index, selected, onClick }: {
  code: TileCode; index: number; selected: boolean; onClick?: () => void;
}) {
  const suit = code[0] as Suit;
  const value = code[1];
  const color = SUIT_COLORS[suit];
  const sym = suit === 'B' ? '竹' : suit === 'C' ? '万' : '●';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative flex flex-col items-center justify-center rounded-lg border w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-[4.25rem] lg:w-16 lg:h-[4.75rem] transition-all duration-150 ${
        selected
          ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50 scale-105'
          : onClick
            ? 'border-slate-700/60 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer active:scale-95'
            : 'border-slate-700/60 bg-slate-900/80'
      }`}
    >
      <span style={{ color }} className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-none">{value}</span>
      <span className="text-[8px] md:text-[10px] text-slate-500 leading-none mt-0.5">{sym}</span>
      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-slate-600 font-mono">{index + 1}</span>
    </button>
  );
}

export default function GuidedMode() {
  const {
    round, score, totalRounds, correctRounds, started, soundEnabled,
    startNewRound, judgeHand, toggleTileSelection, submitPair, submitMeld,
    useHint, skipGrouping, resetGame, toggleSound,
  } = useMahjongGuided();

  if (!started) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">📖</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Guided Mode</h2>
          <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
            Practice identifying winning Mahjong hands step-by-step. First judge if the hand is a winner,
            then identify the <span className="text-indigo-300 font-semibold">pair</span> and <span className="text-violet-300 font-semibold">4 melds</span> by selecting tiles.
            Use hints if you get stuck!
          </p>
          <button
            onClick={startNewRound}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-sm md:text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  const { hand, phase, selectedTiles, foundPair, foundMelds, feedback, showHint, solution, roundComplete, hintsUsed } = round;

  // Determine what the next hint should show
  const hintText = solution && showHint
    ? !foundPair
      ? `Hint: The pair is ${solution.pair[0]} ${solution.pair[1]}`
      : `Hint: Next meld is ${solution.melds[foundMelds.length]?.tiles.join(' ') ?? 'done!'}`
    : null;

  // Tiles already used in found groups
  const usedIndices = new Set<number>();
  if (foundPair) {
    let pairCount = 0;
    for (let i = 0; i < hand.length; i++) {
      if (hand[i] === foundPair[0] && pairCount < 2) {
        usedIndices.add(i);
        pairCount++;
      }
    }
  }
  for (const meld of foundMelds) {
    const meldCodes = [...meld.tiles];
    for (let i = 0; i < hand.length; i++) {
      if (usedIndices.has(i)) continue;
      const idx = meldCodes.indexOf(hand[i]);
      if (idx >= 0) {
        usedIndices.add(i);
        meldCodes.splice(idx, 1);
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Side Panel */}
      <div className="flex flex-col gap-4 w-full md:w-80 shrink-0 overflow-y-auto max-h-full pr-1">
        {/* Score */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Progress</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg md:text-xl font-bold text-indigo-300">{score}</p>
              <p className="text-[10px] md:text-xs text-slate-500">Score</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-emerald-300">{correctRounds}</p>
              <p className="text-[10px] md:text-xs text-slate-500">Correct</p>
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-slate-300">{totalRounds}</p>
              <p className="text-[10px] md:text-xs text-slate-500">Rounds</p>
            </div>
          </div>
        </div>

        {/* Phase 1: Judging */}
        {phase === 'judging' && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Step 1: Judge</h3>
            <p className="text-xs md:text-sm text-slate-400 mb-4">Is this a valid winning hand?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => judgeHand(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm md:text-base font-bold text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25 hover:scale-105 active:scale-95"
              >
                <CheckCircle size={16} /> Win
              </button>
              <button
                onClick={() => judgeHand(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm md:text-base font-bold text-red-300 ring-1 ring-red-500/30 transition-all hover:bg-red-500/25 hover:scale-105 active:scale-95"
              >
                <XCircle size={16} /> Not Win
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Grouping */}
        {phase === 'grouping' && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 md:p-5 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-2">
              Step 2: {!foundPair ? 'Find the Pair' : `Find Meld ${foundMelds.length + 1}/4`}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mb-3">
              {!foundPair
                ? 'Select 2 identical tiles that form the pair.'
                : 'Select 3 tiles that form a pong (AAA) or chow (ABC).'}
            </p>
            <p className="text-xs md:text-sm text-indigo-300 font-mono mb-3">
              Selected: {selectedTiles.length} / {!foundPair ? 2 : 3}
            </p>
            <div className="flex gap-2 mb-3">
              {!foundPair ? (
                <button
                  onClick={submitPair}
                  disabled={selectedTiles.length !== 2}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-2.5 text-xs md:text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={14} /> Submit Pair
                </button>
              ) : (
                <button
                  onClick={submitMeld}
                  disabled={selectedTiles.length !== 3}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-2.5 text-xs md:text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={14} /> Submit Meld
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={useHint} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs md:text-sm font-medium text-amber-300 ring-1 ring-amber-500/30 transition-all hover:bg-amber-500/25">
                <Lightbulb size={14} /> Hint ({hintsUsed})
              </button>
              <button onClick={skipGrouping} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60">
                <SkipForward size={14} /> Skip
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
            phase === 'feedback' && roundComplete
              ? round.playerSaidWin === round.isWinning
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/30 bg-red-500/5'
              : 'border-indigo-500/30 bg-indigo-500/5'
          }`}>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{feedback}</p>
            {hintText && (
              <p className="mt-2 text-xs md:text-sm text-amber-300 font-mono animate-pulse">{hintText}</p>
            )}
            {roundComplete && solution && (
              <div className="mt-3 text-[10px] md:text-xs text-slate-500">
                <p>Solution: Pair {solution.pair.join(' ')}</p>
                {solution.melds.map((m, i) => (
                  <p key={i}>{m.type === 'pong' ? 'Pong' : 'Chow'}: {m.tiles.join(' ')}</p>
                ))}
              </div>
            )}
            {roundComplete && (
              <button
                onClick={startNewRound}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500/20 px-4 py-2.5 text-xs md:text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30"
              >
                Next Round <ArrowRight size={14} />
              </button>
            )}
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
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400">Hand</h3>
            {foundPair && (
              <span className="text-xs md:text-sm font-mono text-emerald-300">
                Pair ✓ | Melds {foundMelds.length}/4
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {hand.map((code, i) => {
              const isUsed = usedIndices.has(i);
              const isSelected = selectedTiles.includes(i);
              const canClick = phase === 'grouping' && !isUsed;

              return (
                <div key={`${code}-${i}`} className={isUsed ? 'opacity-30' : ''}>
                  <GuidedTile
                    code={code}
                    index={i}
                    selected={isSelected}
                    onClick={canClick ? () => toggleTileSelection(i) : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Found groups display */}
        {(foundPair || foundMelds.length > 0) && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 md:p-5 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3">Found Groups</h3>
            {foundPair && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-medium text-slate-600 w-14 shrink-0">Pair</span>
                <div className="flex gap-1">
                  <GuidedTile code={foundPair[0]} index={-1} selected={false} />
                  <GuidedTile code={foundPair[1]} index={-1} selected={false} />
                </div>
              </div>
            )}
            {foundMelds.map((meld, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs font-medium text-slate-600 w-14 shrink-0">
                  {meld.type === 'pong' ? 'Pong' : 'Chow'} {i + 1}
                </span>
                <div className="flex gap-1">
                  {meld.tiles.map((t, j) => (
                    <GuidedTile key={`${t}-${j}`} code={t} index={-1} selected={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
