export function generateFibSequence(n: number): number[] {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

export function nextFibValue(sequence: number[]): number {
  if (sequence.length < 2) return 1;
  return sequence[sequence.length - 1] + sequence[sequence.length - 2];
}

export function validatePlacement(sequence: number[], value: number): boolean {
  const expected = nextFibValue(sequence);
  return value === expected;
}

export function goldenRatio(a: number, b: number): number {
  if (b === 0) return 0;
  return a / b;
}

export function getConvergenceData(sequence: number[]): { index: number; ratio: number }[] {
  const data: { index: number; ratio: number }[] = [];
  for (let i = 2; i < sequence.length; i++) {
    data.push({ index: i, ratio: goldenRatio(sequence[i], sequence[i - 1]) });
  }
  return data;
}

export function computeScore(isCorrect: boolean, streak: number, timeBonus: number): number {
  if (!isCorrect) return -5;
  const base = 10;
  const streakBonus = Math.min(streak, 5) * 2;
  return base + streakBonus + timeBonus;
}

export function generateDistractors(correct: number, count: number): number[] {
  const distractors = new Set<number>();
  distractors.add(correct);

  const nearby = [
    correct - 2, correct - 1, correct + 1, correct + 2,
    correct * 2, Math.floor(correct / 2),
    correct + 3, correct - 3,
  ].filter((v) => v > 0 && v !== correct);

  for (const v of nearby) {
    if (distractors.size >= count + 1) break;
    distractors.add(v);
  }

  while (distractors.size < count + 1) {
    distractors.add(Math.floor(Math.random() * correct * 3) + 1);
  }

  return [...distractors].sort(() => Math.random() - 0.5);
}
