import type { Move, SolveStep } from './types';
import { invertMove } from './cube';

// Solve by reversing known moves (scramble + any user moves).
// Each scramble move is undone in reverse order — guaranteed correct.
export function solveFromMoves(moveHistory: Move[]): SolveStep[] {
  if (moveHistory.length === 0) return [];

  const steps: SolveStep[] = [];
  const total = moveHistory.length;

  for (let i = total - 1; i >= 0; i--) {
    const undoMove = invertMove(moveHistory[i]);
    const progress = total - i;
    const pct = Math.round((progress / total) * 100);
    // Assign a phase label based on progress
    const phase = pct <= 33 ? 'Undo Last Moves' : pct <= 66 ? 'Restoring Middle' : 'Final Restoration';

    steps.push({
      move: undoMove,
      description: `Step ${progress}/${total}: ${describeMoveAction(undoMove)} — undoing ${moveHistory[i]}`,
      phase,
    });
  }

  return optimizeMoves(steps);
}

// Optimise: cancel consecutive inverse pairs and merge same-face quarter turns
function optimizeMoves(steps: SolveStep[]): SolveStep[] {
  let changed = true;
  let result = [...steps];

  while (changed) {
    changed = false;
    const next: SolveStep[] = [];
    let i = 0;
    while (i < result.length) {
      if (i + 1 < result.length) {
        const a = result[i].move;
        const b = result[i + 1].move;
        // Cancel inverse pairs (e.g. R then R')
        if (a === invertMove(b)) {
          i += 2;
          changed = true;
          continue;
        }
        // Merge two identical quarter-turns into a half-turn (e.g. R + R = R2)
        if (a === b && !a.includes('2')) {
          next.push({ ...result[i], move: (a[0] + '2') as Move });
          i += 2;
          changed = true;
          continue;
        }
        // Cancel half-turn + half-turn on the same face (e.g. R2 + R2 = identity)
        if (a === b && a.includes('2')) {
          i += 2;
          changed = true;
          continue;
        }
      }
      next.push(result[i]);
      i++;
    }
    result = next;
  }

  // Re-number descriptions
  return result.map((step, idx) => ({
    ...step,
    description: `Step ${idx + 1}/${result.length}: ${describeMoveAction(step.move)}`,
  }));
}

function describeMoveAction(move: Move): string {
  const faceNames: Record<string, string> = {
    U: 'Top', D: 'Bottom', F: 'Front', B: 'Back', L: 'Left', R: 'Right',
  };
  const face = faceNames[move[0]] || move[0];
  const mod = move.slice(1);
  const dir = mod === "'" ? 'counter-clockwise' : mod === '2' ? '180°' : 'clockwise';
  return `Rotate the ${face} face ${dir}`;
}

// Convenience wrapper used by the hook
export function generateGuidedSteps(moveHistory: Move[]): SolveStep[] {
  return solveFromMoves(moveHistory);
}
