import type { DragBlock } from '../types/fibonacci';

interface BlockTrayProps {
  blocks: DragBlock[];
  lastError: string | null;
  shakeBlockId: number | null;
  isComplete: boolean;
  onPlaceBlock: (size: number) => void;
}

export default function BlockTray({
  blocks,
  lastError,
  shakeBlockId,
  isComplete,
  onPlaceBlock,
}: BlockTrayProps) {
  if (isComplete) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-emerald-300 font-semibold text-sm">Spiral Complete!</p>
        <p className="text-emerald-400/60 text-xs mt-1">Beautiful golden spiral achieved</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Place Next Block
      </h3>

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

      {lastError && (
        <p className="mt-3 text-center text-xs font-medium text-red-400 animate-pulse">
          {lastError}
        </p>
      )}
    </div>
  );
}
