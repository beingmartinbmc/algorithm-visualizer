import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shuffle, RotateCcw, BookOpen, Trophy, Gamepad2, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import Cube3D from './components/Cube3D';
import MoveControls from './components/MoveControls';
import SolvePanel from './components/SolvePanel';
import ChallengePanel from './components/ChallengePanel';
import { useRubiksCube } from './hooks/useRubiksCube';
import { useRubiksSound } from './hooks/useRubiksSound';
import type { GameMode, CubeState } from './engine/types';
import { COLOR_MAP } from './engine/types';

const MODE_CONFIG: { mode: GameMode; label: string; icon: typeof BookOpen; desc: string; gradient: string }[] = [
  {
    mode: 'free',
    label: 'Free Play',
    icon: Gamepad2,
    desc: 'Scramble & solve at your own pace',
    gradient: 'from-cyan-600 to-teal-600',
  },
  {
    mode: 'guided',
    label: 'Guided Mode',
    icon: BookOpen,
    desc: 'Step-by-step solving tutorial',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    mode: 'challenge',
    label: 'Challenge Mode',
    icon: Trophy,
    desc: 'Race to solve the scrambled cube',
    gradient: 'from-amber-600 to-orange-600',
  },
];

export default function RubiksCubePage() {
  const {
    state, reset, scramble, applyUserMove, startSolve,
    stepForward, stepBackward, play, pause, tick, setMode, setSpeed, clearAnimation,
  } = useRubiksCube();

  const sound = useRubiksSound();
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const tickRef = useRef(tick);
  tickRef.current = tick;

  // Track previous solved state to trigger sound
  const prevSolvedRef = useRef(state.isSolved);
  useEffect(() => {
    if (state.isSolved && !prevSolvedRef.current) {
      soundRef.current.playSolved();
    }
    prevSolvedRef.current = state.isSolved;
  }, [state.isSolved]);

  // Play sound on each animated move
  useEffect(() => {
    if (state.animatingMove) {
      soundRef.current.playMove(state.animatingMove);
    }
  }, [state.animatingMove]);

  // Auto-play timer
  useEffect(() => {
    if (!state.isPlaying) return;
    const id = setInterval(() => tickRef.current(), state.speed);
    return () => clearInterval(id);
  }, [state.isPlaying, state.speed]);

  // Auto-solve: set speed then start playing
  const handleAutoSolve = useCallback((speed: number) => {
    setSpeed(speed);
    play();
  }, [play, setSpeed]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <section className="px-6 pt-6 pb-4">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Games
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Rubik's Cube Solver
                </span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                3D interactive cube with step-by-step solving, guided tutorials & timed challenges
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sound.setEnabled(!sound.isEnabled())}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
                title={sound.isEnabled() ? 'Mute' : 'Unmute'}
              >
                {sound.isEnabled() ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              {state.isSolved && state.mode !== 'challenge' && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/30">
                  <span className="text-xs font-semibold text-emerald-400">✓ Solved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mode selector */}
      <section className="px-6 pb-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MODE_CONFIG.map(({ mode, label, icon: Icon, desc, gradient }) => (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  state.mode === mode
                    ? `bg-gradient-to-r ${gradient} border-transparent shadow-lg`
                    : 'bg-slate-900/50 border-slate-700/40 hover:border-slate-600/60'
                }`}
              >
                <Icon size={18} className={state.mode === mode ? 'text-white' : 'text-slate-500'} />
                <div>
                  <div className={`text-xs font-bold ${state.mode === mode ? 'text-white' : 'text-slate-300'}`}>
                    {label}
                  </div>
                  <div className={`text-[10px] ${state.mode === mode ? 'text-white/70' : 'text-slate-500'}`}>
                    {desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6">
          {/* Left: 3D Cube */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 backdrop-blur-sm w-full flex flex-col items-center">
              <Cube3D
                cube={state.cube}
                animatingMove={state.animatingMove}
                onAnimationEnd={clearAnimation}
                size={220}
              />

              {/* Drag hint */}
              <p className="mt-2 text-[10px] text-slate-600 flex items-center gap-1">
                <HelpCircle size={10} /> Drag to rotate the view
              </p>

              {/* Quick actions */}
              <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                {state.mode !== 'challenge' && (
                  <>
                    <button
                      onClick={() => scramble(20)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                    >
                      <Shuffle size={12} /> Scramble
                    </button>
                    {!state.isSolved && state.solveSteps.length === 0 && (
                      <button
                        onClick={startSolve}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500
                          text-white transition-all"
                      >
                        <BookOpen size={12} /> Solve It
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            {/* Face net / flat view */}
            <FlatView cube={state.cube} />
          </div>

          {/* Right: Controls panel */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Mode-specific panel */}
            {state.mode === 'guided' && (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm">
                <SolvePanel
                  steps={state.solveSteps}
                  currentStep={state.currentStep}
                  isPlaying={state.isPlaying}
                  onStepForward={stepForward}
                  onStepBackward={stepBackward}
                  onPause={pause}
                  onReset={() => setMode('guided')}
                  onAutoSolve={handleAutoSolve}
                  speed={state.speed}
                  guidedPhase={state.guidedPhase}
                />
              </div>
            )}

            {state.mode === 'challenge' && (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm">
                <ChallengePanel
                  result={state.challengeResult}
                  userMoves={state.userMoves}
                  startTime={state.challengeStartTime}
                  onNewChallenge={() => setMode('challenge')}
                  scrambleMoves={state.scrambleMoves}
                />
              </div>
            )}

            {state.mode === 'free' && state.solveSteps.length > 0 && (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm">
                <SolvePanel
                  steps={state.solveSteps}
                  currentStep={state.currentStep}
                  isPlaying={state.isPlaying}
                  onStepForward={stepForward}
                  onStepBackward={stepBackward}
                  onPause={pause}
                  onReset={reset}
                  onAutoSolve={handleAutoSolve}
                  speed={state.speed}
                  guidedPhase={state.guidedPhase}
                />
              </div>
            )}

            {/* Move controls (free play & challenge) */}
            {(state.mode === 'free' || state.mode === 'challenge') && (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm">
                <MoveControls
                  onMove={applyUserMove}
                  disabled={state.isPlaying}
                />
              </div>
            )}

            {/* Notation guide */}
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notation Guide</h3>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                <div><span className="font-mono text-slate-300 font-bold">F</span> — Front clockwise</div>
                <div><span className="font-mono text-slate-300 font-bold">F'</span> — Front counter-CW</div>
                <div><span className="font-mono text-slate-300 font-bold">F2</span> — Front 180°</div>
                <div><span className="font-mono text-slate-300 font-bold">U/D</span> — Up / Down</div>
                <div><span className="font-mono text-slate-300 font-bold">L/R</span> — Left / Right</div>
                <div><span className="font-mono text-slate-300 font-bold">B</span> — Back face</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlatView({ cube }: { cube: CubeState }) {
  const cellSize = 18;
  const gap = 1;
  const labels = ['U', 'D', 'F', 'B', 'L', 'R'];

  // Cross layout:      U
  //                   L F R B
  //                     D
  const positions = [
    { face: 0, gx: 1, gy: 0 }, // U
    { face: 4, gx: 0, gy: 1 }, // L
    { face: 2, gx: 1, gy: 1 }, // F
    { face: 5, gx: 2, gy: 1 }, // R
    { face: 3, gx: 3, gy: 1 }, // B
    { face: 1, gx: 1, gy: 2 }, // D
  ];

  const faceBlock = cellSize * 3 + gap * 4;

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 backdrop-blur-sm w-full">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Flat View</h3>
      <div className="flex justify-center">
        <div
          className="relative"
          style={{
            width: faceBlock * 4,
            height: faceBlock * 3,
          }}
        >
          {positions.map(({ face, gx, gy }) => (
            <div
              key={face}
              className="absolute"
              style={{
                left: gx * faceBlock,
                top: gy * faceBlock,
              }}
            >
              <div className="text-[8px] text-slate-600 font-bold mb-0.5 text-center">{labels[face]}</div>
              <div className="grid grid-cols-3" style={{ gap }}>
                {cube[face].map((color, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] border border-black/20"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: COLOR_MAP[color],
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
