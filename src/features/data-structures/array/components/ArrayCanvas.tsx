import type { ArrayCell, ArrayStep, HighlightColor } from '../hooks/useArrayDS';

interface ArrayCanvasProps {
  array: ArrayCell[];
  currentStep: ArrayStep | null;
}

const CELL_COLORS: Record<HighlightColor, string> = {
  green: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
  red: 'border-rose-400 bg-rose-500/20 text-rose-300',
  yellow: 'border-amber-400 bg-amber-500/20 text-amber-300',
  blue: 'border-blue-400 bg-blue-500/20 text-blue-300',
  orange: 'border-orange-400 bg-orange-500/20 text-orange-300',
};

const MAX_VISIBLE = 12;

export default function ArrayCanvas({ array, currentStep }: ArrayCanvasProps) {
  const visible = array.slice(0, MAX_VISIBLE);
  const highlighted = new Set(currentStep?.highlightIndices ?? []);
  const color = currentStep?.highlightColor ?? null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] gap-6 px-4">
      {/* Array cells */}
      <div className="flex flex-col items-center gap-2">
        {array.length === 0 ? (
          <div className="flex items-center justify-center w-48 h-16 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs">
            Empty Array
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-1.5">
            {visible.map((cell, i) => {
              const isHighlighted = highlighted.has(i);
              return (
                <div key={cell.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`
                      flex items-center justify-center rounded-lg border-2 w-12 h-12 md:w-14 md:h-14 font-bold text-sm md:text-base
                      transition-all duration-300
                      ${isHighlighted && color ? CELL_COLORS[color] : 'border-slate-600 bg-slate-800/60 text-slate-200'}
                    `}
                  >
                    {cell.value}
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
                </div>
              );
            })}
            {array.length > MAX_VISIBLE && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-700 w-12 h-12 md:w-14 md:h-14 text-slate-600 text-xs">
                  +{array.length - MAX_VISIBLE}
                </div>
                <span className="text-[10px] font-mono text-slate-600">...</span>
              </div>
            )}
          </div>
        )}

        {/* Bracket lines */}
        {array.length > 0 && (
          <div className="flex items-center gap-1 text-slate-500 font-mono text-sm">
            <span>[</span>
            <span className="flex-1 text-center text-xs text-slate-600">length = {array.length}</span>
            <span>]</span>
          </div>
        )}
      </div>

      {/* Description */}
      {currentStep?.description && (
        <div className="w-full max-w-sm rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs text-indigo-300 leading-relaxed">
          {currentStep.description}
        </div>
      )}
    </div>
  );
}
