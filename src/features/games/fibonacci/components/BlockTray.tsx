import { useState } from 'react';
import type { DragBlock } from '../types/fibonacci';
import type { GameMode } from '../types/fibonacci';

interface BlockTrayProps {
  blocks: DragBlock[];
  mode: GameMode;
  lastError: string | null;
  shakeBlockId: number | null;
  isComplete: boolean;
  onPlaceBlock: (size: number) => void;
}

export default function BlockTray({
  blocks,
  mode,
  lastError,
  shakeBlockId,
  isComplete,
  onPlaceBlock,
}: BlockTrayProps) {
  const [inputValue, setInputValue] = useState('');
  if (isComplete) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-emerald-300 font-semibold text-sm">Spiral Complete!</p>
        <p className="text-emerald-400/60 text-xs mt-1">Beautiful golden spiral achieved</p>
      </div>
    );
  }

  const handleSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) return;
    onPlaceBlock(num);
    setInputValue('');
  };

  const showInput = mode === 'sandbox';

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Place Next Block
      </h3>

      {showInput ? (
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter next number..."
            className="flex-1 rounded-lg bg-slate-800/60 px-3 py-3 text-center text-lg font-mono font-bold text-white placeholder-slate-500 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 px-5 py-3 text-sm font-semibold text-indigo-200 ring-1 ring-indigo-500/30 transition-all hover:from-indigo-500/30 hover:to-violet-500/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Place
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {blocks.map((block) => {
            const isShaking = shakeBlockId === block.size;

            return (
              <button
                key={`${block.id}-${block.size}`}
                onClick={() => onPlaceBlock(block.size)}
                className={`
                  relative flex items-center justify-center rounded-lg font-mono font-bold
                  transition-all duration-200 active:scale-95
                  min-w-[56px] min-h-[56px] px-4 py-3 text-lg
                  bg-gradient-to-br from-indigo-500/20 to-violet-500/20
                  text-indigo-200 ring-1 ring-indigo-500/30
                  hover:from-indigo-500/30 hover:to-violet-500/30 hover:ring-indigo-400/50
                  hover:shadow-lg hover:shadow-indigo-500/10
                  ${isShaking ? 'animate-[shake_0.3s_ease-in-out_2] ring-red-500/60 from-red-500/20 to-rose-500/20 text-red-300' : ''}
                `}
              >
                {block.size}
              </button>
            );
          })}
        </div>
      )}

      {lastError && (
        <p className="mt-3 text-center text-xs font-medium text-red-400 animate-pulse">
          {lastError}
        </p>
      )}
    </div>
  );
}
