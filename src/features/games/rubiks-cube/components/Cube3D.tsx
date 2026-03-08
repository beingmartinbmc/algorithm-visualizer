import { useRef, useEffect, useState, useCallback } from 'react';
import type { CubeState, Move } from '../engine/types';
import { COLOR_MAP } from '../engine/types';

interface Cube3DProps {
  cube: CubeState;
  animatingMove?: Move | null;
  onAnimationEnd?: () => void;
  size?: number;
}

// Map face index + cell to 3D position
// Faces: U=0, D=1, F=2, B=3, L=4, R=5
const FACE_TRANSFORMS: Record<number, string> = {
  0: 'rotateX(90deg)',   // U - top
  1: 'rotateX(-90deg)',  // D - bottom
  2: '',                  // F - front
  3: 'rotateY(180deg)',  // B - back
  4: 'rotateY(-90deg)',  // L - left
  5: 'rotateY(90deg)',   // R - right
};

const FACE_LABELS = ['U', 'D', 'F', 'B', 'L', 'R'];

// Which face indices are affected by each move for animation
const MOVE_FACE_MAP: Record<string, number[]> = {
  U: [0], D: [1], F: [2], B: [3], L: [4], R: [5],
};

const MOVE_AXIS: Record<string, string> = {
  U: 'Y', D: 'Y', F: 'Z', B: 'Z', L: 'X', R: 'X',
};

const MOVE_DIR: Record<string, number> = {
  U: -1, D: 1, F: 1, B: -1, L: 1, R: -1,
};

export default function Cube3D({ cube, animatingMove, onAnimationEnd, size = 200 }: Cube3DProps) {
  const [rotation, setRotation] = useState({ x: -25, y: 35 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [animAngle, setAnimAngle] = useState(0);
  const animRef = useRef<number>(0);

  const cellSize = size / 3;
  const halfSize = size / 2;
  const gap = 2;

  // Animation
  useEffect(() => {
    if (!animatingMove) return;

    let start: number | null = null;
    const duration = 300; // ms
    const face = animatingMove[0];
    const mod = animatingMove.slice(1);
    const targetAngle = mod === '2' ? 180 : mod === "'" ? -90 : 90;
    const dir = MOVE_DIR[face] || 1;
    const finalAngle = targetAngle * dir;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setAnimAngle(finalAngle * eased);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAnimAngle(0);
        onAnimationEnd?.();
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animatingMove, onAnimationEnd]);

  // Mouse drag for rotation
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotation]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation({
      x: dragStart.current.rotX + dy * 0.5,
      y: dragStart.current.rotY + dx * 0.5,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderFace = (faceIndex: number) => {
    const colors = cube[faceIndex];
    const faceTransform = FACE_TRANSFORMS[faceIndex];
    const cells = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        const color = COLOR_MAP[colors[idx]];
        const x = (col - 1) * cellSize;
        const y = (row - 1) * cellSize;

        cells.push(
          <div
            key={`${faceIndex}-${idx}`}
            className="absolute rounded-sm border border-black/30"
            style={{
              width: cellSize - gap,
              height: cellSize - gap,
              backgroundColor: color,
              transform: `translate3d(${x - (cellSize - gap) / 2}px, ${y - (cellSize - gap) / 2}px, 0)`,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          />
        );
      }
    }

    return (
      <div
        key={faceIndex}
        className="absolute"
        style={{
          width: size,
          height: size,
          transform: `${faceTransform} translateZ(${halfSize}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-grab active:cursor-grabbing"
      style={{
        width: size + 100,
        height: size + 100,
        perspective: '800px',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute"
        style={{
          width: size,
          height: size,
          left: '50%',
          top: '50%',
          transformStyle: 'preserve-3d',
          transform: `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(renderFace)}
      </div>
    </div>
  );
}
