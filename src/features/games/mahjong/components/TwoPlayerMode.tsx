import { Users, ArrowRight, RotateCcw, Trophy, Volume2, VolumeX, ArrowLeftRight } from 'lucide-react';
import type { TileCode, Suit } from '../types/mahjong';
import { SUITS, SUIT_NAMES, SUIT_COLORS, TILE_VALUES, HAND_SIZE } from '../types/mahjong';
import { useMahjongTwoPlayer } from '../hooks/useMahjongTwoPlayer';

function TpTile({ code, index: _index, onRemove }: { code: TileCode; index: number; onRemove?: () => void }) {
  const suit = code[0] as Suit;
  const value = code[1];
  const color = SUIT_COLORS[suit];
  const sym = suit === 'B' ? '竹' : suit === 'C' ? '万' : '●';

  if (onRemove) {
    return (
      <button
        onClick={onRemove}
        title={`Remove ${code}`}
        className="group relative flex flex-col items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/80 w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-[4.25rem] transition-all duration-150 hover:border-red-500/50 hover:bg-red-950/20 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span style={{ color }} className="text-sm sm:text-base md:text-lg font-extrabold leading-none">{value}</span>
        <span className="text-[8px] md:text-[10px] text-slate-500 leading-none mt-0.5">{sym}</span>
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/60 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/80 w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-[4.25rem]">
      <span style={{ color }} className="text-sm sm:text-base md:text-lg font-extrabold leading-none">{value}</span>
      <span className="text-[8px] md:text-[10px] text-slate-500 leading-none mt-0.5">{sym}</span>
    </span>
  );
}

function tileCount(hand: TileCode[], code: TileCode): number {
  return hand.filter((t) => t === code).length;
}

function TilePaletteButton({ suit, value, count, disabled, onClick }: {
  suit: Suit; value: number; count: number; disabled: boolean; onClick: () => void;
}) {
  const color = SUIT_COLORS[suit];
  const isFull = count >= 4;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isFull}
      className={`relative flex flex-col items-center justify-center rounded-lg border w-9 h-11 sm:w-10 sm:h-12 md:w-12 md:h-14 text-xs font-bold transition-all duration-150 ${
        disabled || isFull
          ? 'border-slate-800 bg-slate-900/30 text-slate-700 cursor-not-allowed opacity-40'
          : 'border-slate-700/60 bg-slate-900/60 hover:scale-105 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer active:scale-95'
      }`}
    >
      <span style={{ color: disabled || isFull ? undefined : color }} className="text-xs sm:text-sm md:text-base font-extrabold leading-none">{value}</span>
      <span className="text-[7px] md:text-[9px] text-slate-500 leading-none mt-0.5">
        {suit === 'B' ? '竹' : suit === 'C' ? '万' : '●'}
      </span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] md:text-[9px] font-bold text-slate-300 ring-1 ring-slate-600">
          {count}
        </span>
      )}
    </button>
  );
}

export default function TwoPlayerMode() {
  const {
    state, lastError, started, soundEnabled,
    currentHand, currentHandIsFull, bothFull, winner,
    startGame, addTile, removeTile, checkBothHands,
    nextRound, resetGame, switchPlayer, toggleSound,
  } = useMahjongTwoPlayer();

  if (!started) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">2 Player Mode</h2>
          <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
            Take turns placing tiles to build your 14-tile hands. Players alternate picks. 
            Once both hands are complete, the solver checks both — whoever has a valid <span className="text-emerald-400 font-semibold">winning hand</span> scores a point!
          </p>
          <button
            onClick={startGame}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-sm md:text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  const { phase, players, currentPlayer, round } = state;
  const p1 = players[0];
  const p2 = players[1];

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      {/* Side Panel */}
      <div className="flex flex-col gap-4 w-full md:w-80 shrink-0 overflow-y-auto max-h-full pr-1">
        {/* Scoreboard */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-indigo-400" />
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400">Round {round}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg p-3 text-center transition-all ${
              phase === 'building' && currentPlayer === 0
                ? 'bg-indigo-500/15 ring-2 ring-indigo-400/40'
                : 'bg-slate-800/40'
            }`}>
              <p className="text-sm md:text-base font-bold text-indigo-300">{p1.name}</p>
              <p className="text-lg md:text-xl font-extrabold text-white">{p1.score}</p>
              <p className="text-[10px] md:text-xs text-slate-500">{p1.hand.length}/{HAND_SIZE} tiles</p>
              {phase === 'results' && p1.result && (
                <p className={`mt-1 text-[10px] md:text-xs font-bold ${p1.result.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p1.result.isWin ? '✓ Winner' : '✗ No Win'}
                </p>
              )}
            </div>
            <div className={`rounded-lg p-3 text-center transition-all ${
              phase === 'building' && currentPlayer === 1
                ? 'bg-violet-500/15 ring-2 ring-violet-400/40'
                : 'bg-slate-800/40'
            }`}>
              <p className="text-sm md:text-base font-bold text-violet-300">{p2.name}</p>
              <p className="text-lg md:text-xl font-extrabold text-white">{p2.score}</p>
              <p className="text-[10px] md:text-xs text-slate-500">{p2.hand.length}/{HAND_SIZE} tiles</p>
              {phase === 'results' && p2.result && (
                <p className={`mt-1 text-[10px] md:text-xs font-bold ${p2.result.isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p2.result.isWin ? '✓ Winner' : '✗ No Win'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Turn */}
        {phase === 'building' && (
          <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
            currentPlayer === 0 ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-violet-500/30 bg-violet-500/5'
          }`}>
            <p className={`text-sm md:text-base font-bold ${currentPlayer === 0 ? 'text-indigo-300' : 'text-violet-300'}`}>
              {players[currentPlayer].name}'s Turn
            </p>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Pick a tile to add to your hand.</p>
            {!currentHandIsFull && (
              <button
                onClick={switchPlayer}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs md:text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
              >
                <ArrowLeftRight size={14} /> Switch Player
              </button>
            )}
          </div>
        )}

        {/* Check Button */}
        {phase === 'building' && bothFull && (
          <button
            onClick={checkBothHands}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 px-4 py-3 text-sm md:text-base font-bold text-indigo-200 ring-1 ring-indigo-500/30 transition-all hover:from-indigo-500/30 hover:to-violet-500/30 active:scale-95"
          >
            <Trophy size={16} /> Check Both Hands
          </button>
        )}

        {/* Results */}
        {phase === 'results' && winner && (
          <div className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
            winner.includes('Neither') ? 'border-slate-700/50 bg-slate-900/60' : 'border-emerald-500/30 bg-emerald-500/5'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-amber-400" />
              <span className="text-base md:text-lg font-bold text-white">{winner}</span>
            </div>
            {players.map((p, idx) => (
              p.result && p.result.isWin && (
                <div key={idx} className="mt-2 text-[10px] md:text-xs text-slate-500">
                  <p className="font-semibold text-slate-400">{p.name}:</p>
                  <p>Pair: {p.result.pair.join(' ')}</p>
                  {p.result.melds.map((m, i) => (
                    <p key={i}>{m.type === 'pong' ? 'Pong' : 'Chow'}: {m.tiles.join(' ')}</p>
                  ))}
                </div>
              )
            ))}
            <button
              onClick={nextRound}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500/20 px-4 py-2.5 text-xs md:text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30"
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

        {/* Error */}
        {lastError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-center text-xs md:text-sm font-medium text-red-400 animate-pulse">
            {lastError}
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="order-last md:order-first flex md:flex-1 flex-col gap-4 min-h-0 md:overflow-auto">
        {/* Both Players' Hands */}
        {players.map((p, pIdx) => (
          <div key={pIdx} className={`rounded-xl border p-4 md:p-5 backdrop-blur-sm ${
            phase === 'building' && currentPlayer === pIdx
              ? pIdx === 0 ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-violet-500/30 bg-violet-500/5'
              : 'border-slate-700/50 bg-slate-950/80'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${
                pIdx === 0 ? 'text-indigo-400' : 'text-violet-400'
              }`}>{p.name}</h3>
              <span className={`text-xs md:text-sm font-mono font-bold ${p.hand.length === HAND_SIZE ? 'text-emerald-400' : 'text-slate-500'}`}>
                {p.hand.length}/{HAND_SIZE}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2 min-h-[3rem] md:min-h-[4rem]">
              {p.hand.map((code, i) => (
                <TpTile
                  key={`${code}-${i}`}
                  code={code}
                  index={i}
                  onRemove={phase === 'building' && currentPlayer === pIdx ? () => removeTile(i) : undefined}
                />
              ))}
              {p.hand.length < HAND_SIZE && Array.from({ length: HAND_SIZE - p.hand.length }).map((_, i) => (
                <div key={`e-${i}`} className="flex items-center justify-center rounded-lg border border-dashed border-slate-800 w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-[4.25rem] text-slate-800 text-xs">?</div>
              ))}
            </div>
          </div>
        ))}

        {/* Tile Palette (only during building phase) */}
        {phase === 'building' && !currentHandIsFull && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Tile Palette</h3>
            <div className="space-y-3 md:space-y-4">
              {SUITS.map((suit) => (
                <div key={suit}>
                  <p className="text-[10px] md:text-xs font-medium mb-1.5" style={{ color: SUIT_COLORS[suit] }}>
                    {SUIT_NAMES[suit]}
                  </p>
                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {TILE_VALUES.map((v) => {
                      const code = `${suit}${v}` as TileCode;
                      return (
                        <TilePaletteButton
                          key={code}
                          suit={suit}
                          value={v}
                          count={tileCount(currentHand, code)}
                          disabled={currentHandIsFull}
                          onClick={() => addTile(code)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
