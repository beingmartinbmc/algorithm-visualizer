import type { QueueItem, QueueStep } from '../hooks/useQueue';

interface QueueCanvasProps {
  queue: QueueItem[];
  currentStep: QueueStep | null;
}

const HIGHLIGHT_COLORS = {
  green: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
  red: 'border-rose-400 bg-rose-500/20 text-rose-300',
  yellow: 'border-amber-400 bg-amber-500/20 text-amber-300',
};

const MAX_VISIBLE = 8;

export default function QueueCanvas({ queue, currentStep }: QueueCanvasProps) {
  const visible = queue.slice(0, MAX_VISIBLE);
  const highlightIndex = currentStep?.highlightIndex ?? null;
  const highlightColor = currentStep?.highlightColor ?? null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-6 px-4">
      {/* Queue row */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Labels */}
        <div className="flex items-center gap-1.5 w-full justify-center">
          {queue.length > 0 && (
            <div className="flex items-end gap-1.5 flex-wrap justify-center">
              {visible.map((item, i) => {
                const isHighlighted = i === highlightIndex;
                const isFront = i === 0;
                const isRear = i === queue.length - 1 && i < MAX_VISIBLE;

                return (
                  <div key={item.id} className="flex flex-col items-center gap-1">
                    {/* Pointer label */}
                    <div className="h-4 flex items-center">
                      {isFront && <span className="text-[10px] font-mono text-indigo-400">front</span>}
                      {isRear && !isFront && <span className="text-[10px] font-mono text-violet-400">rear</span>}
                      {isFront && isRear && <span className="text-[10px] font-mono text-indigo-400">front/rear</span>}
                    </div>
                    {/* Arrow */}
                    <div className="h-3 flex items-center">
                      {(isFront || isRear) && <span className="text-slate-500 text-sm">↓</span>}
                    </div>
                    {/* Cell */}
                    <div
                      className={`
                        flex items-center justify-center rounded-lg border-2 w-14 h-14 font-bold text-base
                        transition-all duration-300
                        ${isHighlighted && highlightColor
                          ? HIGHLIGHT_COLORS[highlightColor]
                          : 'border-slate-600 bg-slate-800/60 text-slate-200'
                        }
                      `}
                    >
                      {item.value}
                    </div>
                    {/* Index */}
                    <span className="text-[10px] font-mono text-slate-600">{i}</span>
                  </div>
                );
              })}
              {queue.length > MAX_VISIBLE && (
                <div className="flex flex-col items-center gap-1">
                  <div className="h-4" />
                  <div className="h-3" />
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-700 w-14 h-14 text-slate-600 text-xs">
                    +{queue.length - MAX_VISIBLE}
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Arrows showing flow direction */}
        {queue.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="text-indigo-400 font-mono">dequeue ←</span>
            <div className="flex-1 border-t border-dashed border-slate-700" />
            <span className="text-violet-400 font-mono">→ enqueue</span>
          </div>
        )}

        {/* Empty state */}
        {queue.length === 0 && (
          <div className="flex items-center justify-center w-48 h-16 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs">
            Empty Queue
          </div>
        )}
      </div>

      {/* Description */}
      {currentStep?.description && (
        <div className="w-full max-w-sm rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs text-indigo-300 leading-relaxed">
          {currentStep.description}
        </div>
      )}

      {/* Size */}
      <div className="text-xs text-slate-500 font-mono">
        size = {queue.length}
      </div>
    </div>
  );
}
