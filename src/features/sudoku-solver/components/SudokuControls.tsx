import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Zap,
  Loader2,
  PenLine,
  Lock,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import type { GridSize } from '../types/sudoku';
import { GRID_SIZE_INFO } from '../types/sudoku';
import type { EvaluationResult } from '../hooks/useSudoku';

interface SudokuControlsProps {
  gridSize: GridSize;
  stepIndex: number;
  totalSteps: number;
  isSolved: boolean;
  isGenerating: boolean;
  isEditing: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  evaluationResult: EvaluationResult;
  onGenerate: (size: GridSize) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSolveComplete: () => void;
  onEvaluate: () => void;
  onReset: () => void;
  onStartCustom: () => void;
  onEditCurrent: () => void;
  onLockCustom: () => void;
}

const gridSizes: GridSize[] = [4, 9, 16];

export default function SudokuControls({
  gridSize,
  stepIndex,
  totalSteps,
  isSolved,
  isGenerating,
  isEditing,
  canGoNext,
  canGoPrev,
  evaluationResult,
  onGenerate,
  onNextStep,
  onPrevStep,
  onSolveComplete,
  onEvaluate,
  onReset,
  onStartCustom,
  onEditCurrent,
  onLockCustom,
}: SudokuControlsProps) {
  return (
    <div className="flex flex-col gap-5 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Grid Size */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Grid Size
        </h3>
        <div className="flex gap-2">
          {gridSizes.map((size) => {
            const info = GRID_SIZE_INFO[size];
            return (
              <button
                key={size}
                onClick={() => onGenerate(size)}
                disabled={isGenerating}
                className={`
                  flex-1 flex flex-col items-center gap-1 rounded-lg px-3 py-3 transition-all duration-200
                  ${
                    gridSize === size
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="text-sm font-semibold">{info.label}</span>
                <span className="text-[10px] opacity-70">{info.difficulty}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Puzzle */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Custom Puzzle
        </h3>
        {!isEditing ? (
          <div className="space-y-2">
            <button
              onClick={onStartCustom}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2.5 text-sm font-medium text-amber-300 ring-1 ring-amber-500/30 transition-all hover:bg-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PenLine size={14} />
              Start From Blank
            </button>
            <button
              onClick={onEditCurrent}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500/15 px-3 py-2.5 text-sm font-medium text-sky-300 ring-1 ring-sky-500/30 transition-all hover:bg-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil size={14} />
              Edit Current Puzzle
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Click a cell, then type a number (1–{gridSize}). Use arrow keys to navigate. Press Backspace to clear.
            </p>
            <button
              onClick={onLockCustom}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25"
            >
              <Lock size={14} />
              Lock Puzzle & Solve
            </button>
            <button
              onClick={onEvaluate}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500/15 px-3 py-2.5 text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/25"
            >
              <CheckCircle2 size={14} />
              Evaluate
            </button>
            {evaluationResult && (
              <div className={`rounded-lg px-3 py-2 text-xs font-medium text-center ${
                evaluationResult === 'correct'
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : evaluationResult === 'incomplete'
                    ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
              }`}>
                {evaluationResult === 'correct' && 'Solved correctly!'}
                {evaluationResult === 'incomplete' && 'Some cells are still empty.'}
                {evaluationResult === 'errors' && 'There are conflicts in your solution.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          About
        </h3>
        <div className="rounded-lg bg-slate-800/40 p-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Uses a backtracking algorithm to solve the puzzle. Step through each decision the solver makes
            — placing a number (green) or backtracking when stuck (red).
          </p>
          <div className="mt-2 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20">
              Backtracking
            </span>
            <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400 ring-1 ring-cyan-500/20">
              Constraint Propagation
            </span>
          </div>
        </div>
      </div>

      {/* Step Controls */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Step Controls
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onPrevStep}
            disabled={!canGoPrev || isGenerating}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <button
            onClick={onNextStep}
            disabled={!canGoNext || isSolved || isGenerating}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
        {totalSteps > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">
              {Math.max(0, stepIndex + 1)} / {totalSteps}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onSolveComplete}
          disabled={isSolved || isGenerating}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Solve Complete
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onGenerate(gridSize)}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle size={12} />
            New Puzzle
          </button>
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Status
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Grid</span>
            <span className="text-sm font-mono font-semibold text-slate-300">{GRID_SIZE_INFO[gridSize].label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">State</span>
            <span className={`text-xs font-semibold ${isSolved ? 'text-emerald-400' : stepIndex >= 0 ? 'text-violet-400' : 'text-slate-500'}`}>
              {isSolved ? 'Solved!' : stepIndex >= 0 ? 'Stepping...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-slate-900/60 ring-1 ring-slate-700" />
            <span className="text-xs text-slate-400">Empty Cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-white/20" />
            <span className="text-xs text-slate-400">Original Clue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-emerald-500/25 ring-1 ring-emerald-400/50" />
            <span className="text-xs text-slate-400">Placing Number</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-rose-500/20 ring-1 ring-rose-400/40" />
            <span className="text-xs text-slate-400">Backtracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-sm bg-indigo-400/40" />
            <span className="text-xs text-slate-400">Solver Filled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
