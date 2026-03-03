import type { StackItem, StackStep } from '../hooks/useStack';

interface StackCanvasProps {
  stack: StackItem[];
  currentStep: StackStep | null;
}

const HIGHLIGHT_COLORS = {
  green: 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
  red: 'border-rose-400 bg-rose-500/20 text-rose-300',
  yellow: 'border-amber-400 bg-amber-500/20 text-amber-300',
};

const MAX_VISIBLE = 12;

export default function StackCanvas({ stack, currentStep }: StackCanvasProps) {
  const visible = stack.slice(-MAX_VISIBLE);
  const highlightIndex = currentStep?.highlightIndex ?? null;
  const highlightColor = currentStep?.highlightColor ?? null;

  return (
    <div className="flex flex-col items-center justify-end w-full h-full min-h-[300px] md:min-h-[400px] gap-1 pb-6">
      {/* Empty state */}
      {stack.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
          <div className="w-32 h-24 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-xs">Empty Stack</span>
          </div>
          <div className="w-32 border-b-2 border-slate-600" />
        </div>
      )}

      {/* Stack items — rendered top-to-bottom visually (top of stack is first in array) */}
      <div className="flex flex-col-reverse items-center gap-1.5 w-full max-w-[200px]">
        {visible.map((item, visIdx) => {
          const actualIndex = stack.length - visible.length + visIdx;
          const isHighlighted = actualIndex === highlightIndex;
          const isTop = actualIndex === stack.length - 1;

          return (
            <div key={item.id} className="relative flex items-center gap-2 w-full">
              {/* Top label */}
              {isTop && (
                <span className="absolute -right-14 text-xs font-mono text-indigo-400 whitespace-nowrap">← top</span>
              )}
              <div
                className={`
                  flex-1 flex items-center justify-center rounded-lg border-2 h-12 font-bold text-lg
                  transition-all duration-300
                  ${isHighlighted && highlightColor
                    ? HIGHLIGHT_COLORS[highlightColor]
                    : 'border-slate-600 bg-slate-800/60 text-slate-200'
                  }
                `}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Base */}
      {stack.length > 0 && (
        <div className="w-full max-w-[200px] border-b-4 border-slate-500 rounded mt-1" />
      )}

      {/* Description */}
      {currentStep?.description && (
        <div className="mt-4 w-full max-w-sm rounded-lg bg-slate-800/60 px-4 py-2 text-center text-xs text-indigo-300 leading-relaxed">
          {currentStep.description}
        </div>
      )}

      {/* Size badge */}
      <div className="mt-2 text-xs text-slate-500 font-mono">
        size = {stack.length}
      </div>
    </div>
  );
}
