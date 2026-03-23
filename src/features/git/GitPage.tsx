import { GitCanvas } from './components/GitCanvas';
import { GitTerminal } from './components/GitTerminal';
import { GitFileStatus } from './components/GitFileStatus';
import { GitCommandRef } from './components/GitCommandRef';
import { GuidedPanel, StepProgress } from './components/GuidedPanel';
import { useGit } from './hooks/useGit';
import type { DemoSpeed } from './hooks/useGit';

const SPEED_LABELS: { value: DemoSpeed; label: string }[] = [
  { value: 'slow', label: '0.5x' },
  { value: 'normal', label: '1x' },
  { value: 'fast', label: '2.5x' },
];

export default function GitPage() {
  const {
    mode,
    gitState,
    history,
    commandHistory,
    isRunningDemo,
    demoPaused,
    demoSpeed,
    demoProgress,
    demoTotal,
    soundEnabled,
    toggleSound,
    executeCommand,
    runDemo,
    stopDemo,
    pauseDemo,
    resumeDemo,
    changeDemoSpeed,
    resetState,
    switchMode,
    activeLesson,
    currentStep,
    completedLessons,
    startLesson,
    restartLesson,
    lessons,
  } = useGit();

  const currentBranch = gitState.detachedHead
    ? `detached @ ${gitState.head.slice(0, 7)}`
    : gitState.head;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/50 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
            <circle cx="18" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <path d="M6 21V9a9 9 0 0 0 9 9" />
          </svg>
          <h2 className="text-sm font-bold text-white">Git Visualizer</h2>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center rounded-lg bg-slate-800/60 p-0.5">
          <button
            onClick={() => switchMode('guided')}
            className={`rounded-md px-3 py-1 text-[10px] font-medium transition-all ${
              mode === 'guided'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Guided
          </button>
          <button
            onClick={() => switchMode('freeplay')}
            className={`rounded-md px-3 py-1 text-[10px] font-medium transition-all ${
              mode === 'freeplay'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Freeplay
          </button>
        </div>

        {gitState.initialized && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-slate-300 font-mono">{currentBranch}</span>
            {gitState.remotes.length > 0 && (
              <>
                <div className="h-3 w-px bg-slate-700 mx-1" />
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="text-[9px] text-slate-500 font-mono">{gitState.remotes[0].name}</span>
              </>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toggleSound(!soundEnabled)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all ${
              soundEnabled
                ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                : 'bg-slate-800/50 text-slate-500'
            }`}
          >
            {soundEnabled ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            Sound
          </button>

          {mode === 'freeplay' && !isRunningDemo && (
            <button
              onClick={runDemo}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run Demo
            </button>
          )}

          <button
            onClick={mode === 'guided' && activeLesson ? restartLesson : resetState}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-300"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Demo playback bar */}
      {isRunningDemo && (
        <div className="flex items-center gap-3 border-b border-slate-800/50 px-4 py-2 sm:px-6 bg-slate-900/40">
          {/* Play / Pause */}
          <button
            onClick={demoPaused ? resumeDemo : pauseDemo}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
            title={demoPaused ? 'Resume' : 'Pause'}
          >
            {demoPaused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stopDemo}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            title="Stop"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(demoProgress / demoTotal) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono tabular-nums w-10 text-right">
              {demoProgress}/{demoTotal}
            </span>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-800/60 p-0.5">
            {SPEED_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => changeDemoSpeed(value)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                  demoSpeed === value
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {demoPaused && (
            <span className="text-[10px] text-amber-400 font-medium animate-pulse">PAUSED</span>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-3 sm:p-4 lg:flex-row lg:gap-4">
        {/* Left column — Graph + File Status */}
        <div className="flex flex-1 flex-col gap-3 min-w-0 lg:flex-[1.2]">
          <div className="flex-1 flex min-h-[250px]">
            <GitCanvas state={gitState} />
          </div>
          {gitState.initialized && <GitFileStatus state={gitState} />}
        </div>

        {/* Right column — Terminal + Panels */}
        <div className="flex flex-col gap-3 lg:w-[380px] xl:w-[420px]">
          {mode === 'guided' && activeLesson && (
            <StepProgress
              lesson={activeLesson}
              currentStep={currentStep}
              onRestart={restartLesson}
            />
          )}

          <div className="flex-1">
            <GitTerminal
              history={history}
              commandHistory={commandHistory}
              onExecute={executeCommand}
              disabled={isRunningDemo}
            />
          </div>

          {mode === 'guided' ? (
            <GuidedPanel
              lessons={lessons}
              completedLessons={completedLessons}
              activeLessonId={activeLesson?.id}
              onSelect={startLesson}
            />
          ) : (
            <GitCommandRef onRunCommand={executeCommand} disabled={isRunningDemo} />
          )}
        </div>
      </div>
    </div>
  );
}
