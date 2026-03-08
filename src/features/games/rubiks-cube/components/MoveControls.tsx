import type { Move } from '../engine/types';

interface MoveControlsProps {
  onMove: (move: Move) => void;
  disabled?: boolean;
}

const MOVE_GROUPS: { label: string; moves: Move[] }[] = [
  { label: 'Up', moves: ['U', "U'", 'U2'] },
  { label: 'Down', moves: ['D', "D'", 'D2'] },
  { label: 'Front', moves: ['F', "F'", 'F2'] },
  { label: 'Back', moves: ['B', "B'", 'B2'] },
  { label: 'Left', moves: ['L', "L'", 'L2'] },
  { label: 'Right', moves: ['R', "R'", 'R2'] },
];

const FACE_COLORS: Record<string, string> = {
  Up: 'bg-white text-black',
  Down: 'bg-yellow-400 text-black',
  Front: 'bg-red-600 text-white',
  Back: 'bg-orange-500 text-white',
  Left: 'bg-blue-600 text-white',
  Right: 'bg-green-600 text-white',
};

export default function MoveControls({ onMove, disabled }: MoveControlsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manual Moves</h3>
      <div className="grid grid-cols-3 gap-2">
        {MOVE_GROUPS.map(({ label, moves }) => (
          <div key={label} className="space-y-1">
            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${FACE_COLORS[label]} text-center`}>
              {label}
            </div>
            <div className="flex gap-0.5">
              {moves.map(m => (
                <button
                  key={m}
                  onClick={() => onMove(m)}
                  disabled={disabled}
                  className="flex-1 px-1 py-1 text-[10px] font-mono font-bold rounded
                    bg-slate-800 hover:bg-slate-700 text-slate-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-colors border border-slate-700/50"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
