import { BookOpen, Gamepad2, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RubiksMode } from './types/rubiksCube';
import { CubeCanvas } from './components/CubeCanvas';
import { RubiksCubeControls } from './components/RubiksCubeControls';
import { useRubiksCube } from './hooks/useRubiksCube';

const MODES: { id: RubiksMode; label: string; icon: ReactNode }[] = [
  { id: 'guided', label: 'Guided Mode', icon: <BookOpen size={14} /> },
  { id: 'freeplay', label: 'Freeplay Mode', icon: <Gamepad2 size={14} /> },
  { id: 'challenge', label: 'Challenge Mode', icon: <Trophy size={14} /> },
];

export default function RubiksCubeGamePage() {
  const cube = useRubiksCube();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-700/50 bg-slate-900/40 px-4 pt-3 backdrop-blur-sm md:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => cube.switchMode(mode.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-medium transition-all md:text-sm ${
                cube.mode === mode.id
                  ? 'bg-slate-800/80 text-indigo-300 border border-b-0 border-slate-700/50 -mb-px'
                  : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:gap-6">
          <main className="order-last flex min-w-0 flex-1 flex-col gap-4 md:order-first">
            <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm md:p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">Rubik's Cube Solver</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Manipulate a 3D Rubik's Cube, generate or enter scrambles, and watch a CFOP-inspired solve sequence step by step.
                  </p>
                </div>
                <div className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-semibold text-violet-300 ring-1 ring-violet-500/30">
                  3D Cube
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-indigo-500/5 px-3 py-2 ring-1 ring-indigo-500/15">
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Move notation: <span className="font-mono text-cyan-300">R</span> turns a face clockwise,
                  <span className="font-mono text-cyan-300"> R'</span> turns it counter-clockwise, and
                  <span className="font-mono text-cyan-300"> R2</span> turns it twice. The inverse shorthand
                  <span className="font-mono text-cyan-300"> Ri</span> is also accepted.
                </p>
              </div>
            </section>

            <CubeCanvas cube={cube.cube} solved={cube.solved} onMove={cube.makeMove} />
          </main>

          <RubiksCubeControls
            mode={cube.mode}
            message={cube.message}
            moveHistory={cube.moveHistory}
            scrambleMoves={cube.scrambleMoves}
            solution={cube.solution}
            solutionIndex={cube.solutionIndex}
            solutionDone={cube.solutionDone}
            solverPlaybackMode={cube.solverPlaybackMode}
            solverSpeed={cube.solverSpeed}
            manualMove={cube.manualMove}
            customScramble={cube.customScramble}
            simulationRuns={cube.simulationRuns}
            simulationResult={cube.simulationResult}
            guidedStep={cube.guidedStep}
            guidedScript={cube.guidedScript}
            challenges={cube.challenges}
            selectedChallenge={cube.selectedChallenge}
            challengeStarted={cube.challengeStarted}
            challengeMoves={cube.challengeMoves}
            challengeSolved={cube.challengeSolved}
            soundEnabled={cube.soundEnabled}
            onManualMoveChange={cube.setManualMove}
            onCustomScrambleChange={cube.setCustomScramble}
            onSimulationRunsChange={cube.setSimulationRuns}
            onApplyManualMove={cube.applyManualMove}
            onScramble={cube.runScramble}
            onApplyCustomScramble={cube.runCustomScramble}
            onSimulateSolves={cube.simulateSolves}
            onGenerateSolution={cube.generateSolution}
            onStepSolution={cube.stepSolution}
            onAutoSolve={cube.autoSolve}
            onSolverSpeedChange={cube.setSolverSpeed}
            onUndo={cube.undoLastMove}
            onReset={cube.resetCube}
            onNextGuidedStep={cube.nextGuidedStep}
            onSelectChallenge={cube.setSelectedChallenge}
            onStartChallenge={cube.startChallenge}
            onToggleSound={cube.toggleSound}
          />
        </div>
      </div>
    </div>
  );
}
