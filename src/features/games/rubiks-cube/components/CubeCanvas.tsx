import { memo } from 'react';
import type { CubeFace, CubeMove, CubeState } from '../types/rubiksCube';
import { ALL_MOVES, FACE_COLORS, FACE_LABELS } from '../types/rubiksCube';

const FACE_TRANSFORMS: Record<CubeFace, string> = {
  F: 'translateZ(72px)',
  B: 'rotateY(180deg) translateZ(72px)',
  R: 'rotateY(90deg) translateZ(72px)',
  L: 'rotateY(-90deg) translateZ(72px)',
  U: 'rotateX(90deg) translateZ(72px)',
  D: 'rotateX(-90deg) translateZ(72px)',
};

const FACE_ORDER: CubeFace[] = ['F', 'R', 'U', 'L', 'D', 'B'];

interface Props {
  cube: CubeState;
  solved: boolean;
  onMove: (move: CubeMove) => void;
}

function CubeCanvasInner({ cube, solved, onMove }: Props) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Cube State</h3>
          <p className="text-[11px] text-slate-500">2D cube net with full face-turn simulation</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
          solved
            ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
            : 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
        }`}>
          {solved ? 'Solved' : 'Scrambled'}
        </span>
      </div>

      <div className="flex min-h-[290px] items-center justify-center overflow-hidden rounded-xl bg-slate-950/40 ring-1 ring-slate-800/60">
        <div className="relative h-56 w-56" style={{ perspective: '900px' }}>
          <div
            className="absolute left-1/2 top-1/2 h-36 w-36 transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translate(-50%, -50%) rotateX(-24deg) rotateY(38deg) rotateZ(0deg)',
            }}
          >
            {FACE_ORDER.map((face) => (
              <div
                key={face}
                className="absolute left-0 top-0 grid h-36 w-36 grid-cols-3 gap-1 rounded-xl border border-slate-950/70 bg-slate-950/90 p-1.5 shadow-2xl"
                style={{
                  transform: FACE_TRANSFORMS[face],
                  backfaceVisibility: 'hidden',
                }}
                aria-label={`${FACE_LABELS[face]} face`}
              >
                {cube[face].map((color, index) => (
                  <div
                    key={`${face}-${index}`}
                    className="rounded-md border border-slate-950/50 shadow-inner transition-colors duration-300"
                    style={{ backgroundColor: FACE_COLORS[color] }}
                  />
                ))}
                <span className="pointer-events-none absolute left-2 top-1 text-[10px] font-black text-slate-950/50">
                  {face}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-2 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-black/30 blur-xl" />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick Turns</span>
          <span className="text-[10px] text-slate-600">Clockwise / inverse / double</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          {ALL_MOVES.map((move) => (
            <button
              key={move}
              onClick={() => onMove(move)}
              className="rounded-lg bg-slate-800/70 px-2 py-1.5 text-[11px] font-semibold text-slate-300 ring-1 ring-slate-700/40 transition-all hover:bg-indigo-500/15 hover:text-indigo-300 hover:ring-indigo-500/30"
            >
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const CubeCanvas = memo(CubeCanvasInner);
