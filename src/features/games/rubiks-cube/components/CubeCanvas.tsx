import { memo, useCallback, useState } from 'react';
import type { PointerEvent } from 'react';
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
const INITIAL_ROTATION = { x: -24, y: 38 };
const ROTATION_STEP = 18;

interface ViewRotation {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  rotation: ViewRotation;
}

interface Props {
  cube: CubeState;
  solved: boolean;
  onMove: (move: CubeMove) => void;
}

function CubeCanvasInner({ cube, solved, onMove }: Props) {
  const [rotation, setRotation] = useState<ViewRotation>(INITIAL_ROTATION);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const rotateView = useCallback((deltaX: number, deltaY: number) => {
    setRotation((current) => ({
      x: clampRotationX(current.x + deltaX),
      y: current.y + deltaY,
    }));
  }, []);

  const resetView = useCallback(() => {
    setRotation(INITIAL_ROTATION);
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rotation,
    });
  }, [rotation]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    setRotation({
      x: clampRotationX(dragState.rotation.x - deltaY * 0.35),
      y: dragState.rotation.y + deltaX * 0.35,
    });
  }, [dragState]);

  const handlePointerEnd = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragState(null);
  }, [dragState]);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Cube State</h3>
          <p className="text-[11px] text-slate-500">Drag the 3D cube to rotate the view</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
          solved
            ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
            : 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
        }`}>
          {solved ? 'Solved' : 'Scrambled'}
        </span>
      </div>

      <div
        className="flex min-h-[290px] touch-none cursor-grab items-center justify-center overflow-hidden rounded-xl bg-slate-950/40 ring-1 ring-slate-800/60 active:cursor-grabbing"
        role="img"
        aria-label="Interactive 3D Rubik's Cube view. Drag to rotate the cube."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="relative h-56 w-56" style={{ perspective: '900px' }}>
          <div
            className={`absolute left-1/2 top-1/2 h-36 w-36 ${dragState ? '' : 'transition-transform duration-500'}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(0deg)`,
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500">View angle: X {Math.round(rotation.x)}deg / Y {Math.round(rotation.y)}deg</span>
        <div className="flex flex-wrap gap-1.5">
          <ViewButton label="Up" onClick={() => rotateView(-ROTATION_STEP, 0)} />
          <ViewButton label="Down" onClick={() => rotateView(ROTATION_STEP, 0)} />
          <ViewButton label="Left" onClick={() => rotateView(0, -ROTATION_STEP)} />
          <ViewButton label="Right" onClick={() => rotateView(0, ROTATION_STEP)} />
          <ViewButton label="Reset View" onClick={resetView} />
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

function clampRotationX(value: number) {
  return Math.max(-75, Math.min(75, value));
}

function ViewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-slate-800/70 px-2 py-1 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-700/40 transition-all hover:bg-indigo-500/15 hover:text-indigo-300 hover:ring-indigo-500/30"
    >
      {label}
    </button>
  );
}

export const CubeCanvas = memo(CubeCanvasInner);
