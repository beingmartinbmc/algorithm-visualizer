import { memo } from 'react';
import type { ReactNode } from 'react';
import { RotateCcw, Shuffle, SkipForward, Volume2, VolumeX, Wand2 } from 'lucide-react';
import type { Challenge, CubeMove, RubiksMode, SimulationResult, SolutionStep, SolverPlaybackMode, SolverSpeed } from '../types/rubiksCube';
import { SOLVER_SPEED_OPTIONS } from '../types/rubiksCube';
import { formatMoves } from '../engine/scramble';

interface Props {
  mode: RubiksMode;
  message: string;
  moveHistory: CubeMove[];
  scrambleMoves: CubeMove[];
  solution: SolutionStep[];
  solutionIndex: number;
  solutionDone: boolean;
  solverPlaybackMode: SolverPlaybackMode;
  solverSpeed: SolverSpeed;
  manualMove: string;
  customScramble: string;
  simulationRuns: number;
  simulationResult: SimulationResult | null;
  guidedStep: number;
  guidedScript: string[];
  challenges: Challenge[];
  selectedChallenge: Challenge;
  challengeStarted: boolean;
  challengeMoves: number;
  challengeSolved: boolean;
  soundEnabled: boolean;
  onManualMoveChange: (value: string) => void;
  onCustomScrambleChange: (value: string) => void;
  onSimulationRunsChange: (value: number) => void;
  onApplyManualMove: () => void;
  onScramble: (length?: number) => void;
  onApplyCustomScramble: () => void;
  onSimulateSolves: () => void;
  onGenerateSolution: () => void;
  onStepSolution: () => void;
  onAutoSolve: () => void;
  onSolverSpeedChange: (speed: SolverSpeed) => void;
  onUndo: () => void;
  onReset: () => void;
  onNextGuidedStep: () => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onStartChallenge: (challenge?: Challenge) => void;
  onToggleSound: (enabled: boolean) => void;
}

function RubiksCubeControlsInner({
  mode,
  message,
  moveHistory,
  scrambleMoves,
  solution,
  solutionIndex,
  solutionDone,
  solverPlaybackMode,
  solverSpeed,
  manualMove,
  customScramble,
  simulationRuns,
  simulationResult,
  guidedStep,
  guidedScript,
  challenges,
  selectedChallenge,
  challengeStarted,
  challengeMoves,
  challengeSolved,
  soundEnabled,
  onManualMoveChange,
  onCustomScrambleChange,
  onSimulationRunsChange,
  onApplyManualMove,
  onScramble,
  onApplyCustomScramble,
  onSimulateSolves,
  onGenerateSolution,
  onStepSolution,
  onAutoSolve,
  onSolverSpeedChange,
  onUndo,
  onReset,
  onNextGuidedStep,
  onSelectChallenge,
  onStartChallenge,
  onToggleSound,
}: Props) {
  const solverSpeedIndex = Math.max(0, SOLVER_SPEED_OPTIONS.findIndex((option) => option.id === solverSpeed));
  const selectedSolverSpeed = SOLVER_SPEED_OPTIONS[solverSpeedIndex] ?? SOLVER_SPEED_OPTIONS[1];

  return (
    <aside className="w-full space-y-4 md:w-80 md:shrink-0">
      <Panel title="Status">
        <p className="text-xs leading-relaxed text-slate-300">{message}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Moves" value={moveHistory.length} />
          <Stat label="Solution" value={solution.length > 0 ? `${solutionIndex}/${solution.length}` : '-'} />
        </div>
      </Panel>

      {mode === 'guided' && (
        <Panel title="Guided Mode">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Learn notation, scrambling, and CFOP-inspired phase labels step by step.
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            Reference style: Cross → F2L → 2-Look OLL → 2-Look PLL.
          </p>
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Step {guidedStep + 1} / {guidedScript.length}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{guidedScript[guidedStep]}</p>
          </div>
          <button onClick={onNextGuidedStep} className="mt-3 w-full rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30">
            Continue Guided Step
          </button>
        </Panel>
      )}

      {mode === 'freeplay' && (
        <Panel title="Freeplay Mode">
          <ManualMoveInput
            value={manualMove}
            onChange={onManualMoveChange}
            onApply={onApplyManualMove}
          />
          <div className="mt-3">
            <label className="text-[11px] text-slate-400">Custom scramble</label>
            <textarea
              value={customScramble}
              onChange={(event) => onCustomScrambleChange(event.target.value)}
              rows={2}
              placeholder="R U R' U' or Ri U R U2"
              className="mt-1 w-full resize-none rounded-lg bg-slate-950/70 px-3 py-2 text-xs font-mono text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-cyan-500/50"
            />
            <button
              onClick={onApplyCustomScramble}
              className="mt-2 w-full rounded-lg bg-violet-500/20 px-3 py-2 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/40 hover:bg-violet-500/30"
            >
              Apply Custom Scramble
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionButton onClick={() => onScramble(12)} icon={<Shuffle size={13} />} label="12-Move Scramble" />
            <ActionButton onClick={() => onScramble(25)} icon={<Shuffle size={13} />} label="25-Move Scramble" />
            <ActionButton onClick={onGenerateSolution} icon={<Wand2 size={13} />} label="Find Solution" />
            <ActionButton onClick={onAutoSolve} icon={<SkipForward size={13} />} label="Auto Run" />
            <ActionButton onClick={onUndo} label="Undo" />
            <ActionButton onClick={onReset} icon={<RotateCcw size={13} />} label="Reset" />
          </div>
          <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
            <label className="text-[11px] text-slate-400">Simulation runs</label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={simulationRuns}
                onChange={(event) => onSimulationRunsChange(Number(event.target.value) || 1)}
                className="min-w-0 flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm font-mono text-slate-200 ring-1 ring-slate-700/50"
              />
              <button
                onClick={onSimulateSolves}
                className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70"
              >
                Run
              </button>
            </div>
          </div>
        </Panel>
      )}

      {mode === 'challenge' && (
        <Panel title="Challenge Mode">
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge)}
                className={`w-full rounded-lg px-3 py-2 text-left ring-1 transition-all ${
                  selectedChallenge.id === challenge.id
                    ? 'bg-rose-500/15 text-rose-200 ring-rose-500/40'
                    : 'bg-slate-800/50 text-slate-400 ring-slate-700/40 hover:bg-slate-700/50'
                }`}
              >
                <div className="text-xs font-semibold">{challenge.title}</div>
                <div className="mt-0.5 text-[10px] text-slate-500">{challenge.description}</div>
              </button>
            ))}
          </div>
          <button onClick={() => onStartChallenge(selectedChallenge)} className="mt-3 w-full rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/30">
            Start Challenge
          </button>
          {challengeStarted && (
            <div className="mt-3 space-y-3">
              <ManualMoveInput value={manualMove} onChange={onManualMoveChange} onApply={onApplyManualMove} />
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Your Moves" value={challengeMoves} />
                <Stat label="Target" value={selectedChallenge.targetMoves} />
              </div>
              {challengeSolved && (
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 ring-1 ring-emerald-500/30">
                  Solved in {challengeMoves} moves.
                </div>
              )}
            </div>
          )}
        </Panel>
      )}

      <Panel title="Solver">
        <div className="space-y-2 text-[11px] text-slate-400">
          <p><span className="text-slate-500">Scramble:</span> {formatMoves(scrambleMoves)}</p>
          <p><span className="text-slate-500">History:</span> {formatMoves(moveHistory.slice(-12))}</p>
        </div>
        <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Playback</span>
            <span className="text-[10px] text-slate-500">{selectedSolverSpeed.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PlaybackButton
              label="Manual Step"
              active={solverPlaybackMode === 'manual'}
              disabled={solutionDone || solution.length === 0}
              onClick={onStepSolution}
            />
            <PlaybackButton
              label="Auto"
              active={solverPlaybackMode === 'auto'}
              disabled={solutionDone || (solution.length === 0 && moveHistory.length === 0)}
              onClick={onAutoSolve}
            />
          </div>
          <input
            type="range"
            min={0}
            max={SOLVER_SPEED_OPTIONS.length - 1}
            step={1}
            value={solverSpeedIndex}
            onChange={(event) => {
              const nextSpeed = SOLVER_SPEED_OPTIONS[Number(event.target.value)]?.id;
              if (nextSpeed) onSolverSpeedChange(nextSpeed);
            }}
            className="mt-3 w-full accent-indigo-400"
            aria-label="Solver auto playback speed"
          />
          <div className="mt-1 flex justify-between">
            {SOLVER_SPEED_OPTIONS.map((option) => (
              <span
                key={option.id}
                className={`text-[9px] uppercase tracking-wide ${
                  option.id === solverSpeed ? 'text-indigo-300' : 'text-slate-600'
                }`}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>
        {solution.length > 0 && (
          <div className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-slate-950/50 p-2">
            {solution.map((step, index) => (
              <div
                key={`${step.move}-${index}`}
                className={`flex items-center gap-2 rounded px-2 py-1 text-[11px] ${
                  index < solutionIndex
                    ? 'text-emerald-400'
                    : index === solutionIndex
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-slate-500'
                }`}
              >
                <span className="font-mono">{index + 1}.</span>
                <span className="font-bold">{step.move}</span>
                <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400">
                  {step.phase}
                </span>
                <span className="truncate">{step.description}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton onClick={onGenerateSolution} icon={<Wand2 size={13} />} label="Prepare Solve" />
          <ActionButton onClick={onAutoSolve} disabled={solutionDone || (solution.length === 0 && moveHistory.length === 0)} icon={<SkipForward size={13} />} label="Auto Run" />
        </div>
      </Panel>

      {simulationResult && (
        <Panel title="Simulation">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Runs" value={simulationResult.runs} />
            <Stat label="Best" value={simulationResult.best.solutionLength} />
            <Stat label="Worst" value={simulationResult.worst.solutionLength} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Average solution length: {simulationResult.averageLength.toFixed(1)}
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            Best scramble: {formatMoves(simulationResult.best.scramble)}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
            Worst scramble: {formatMoves(simulationResult.worst.scramble)}
          </p>
        </Panel>
      )}

      <Panel title="Settings">
        <button
          onClick={() => onToggleSound(!soundEnabled)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ring-1 ${
            soundEnabled
              ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
              : 'bg-slate-800/70 text-slate-400 ring-slate-700/40'
          }`}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </Panel>
    </aside>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-800/50 px-2.5 py-2 ring-1 ring-slate-700/40">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-sm font-mono text-slate-100">{value}</div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/70 px-3 py-2 text-[11px] font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

function PlaybackButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-[11px] font-semibold ring-1 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/40'
          : 'bg-slate-800/70 text-slate-300 ring-slate-700/50 hover:bg-slate-700/70'
      }`}
    >
      {label}
    </button>
  );
}

function ManualMoveInput({
  value,
  onChange,
  onApply,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-slate-400">Move notation</label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onApply();
          }}
          placeholder="R, U', F2"
          className="min-w-0 flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm font-mono text-slate-200 ring-1 ring-slate-700/50 outline-none focus:ring-cyan-500/50"
        />
        <button
          onClick={onApply}
          className="rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export const RubiksCubeControls = memo(RubiksCubeControlsInner);
