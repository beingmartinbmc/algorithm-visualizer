export type RecursionAlgorithm = 'naive' | 'memoized' | 'iterative';
export type RecursionProblem = 'fibonacci' | 'factorial' | 'staircase' | 'coin-change';

export const PROBLEM_OPTIONS: { value: RecursionProblem; label: string; desc: string; inputLabel: string; inputMin: number; inputMax: number; defaultN: number }[] = [
  { value: 'fibonacci', label: 'Fibonacci', desc: 'Compute the Nth Fibonacci number', inputLabel: 'N', inputMin: 5, inputMax: 25, defaultN: 15 },
  { value: 'factorial', label: 'Factorial', desc: 'Compute N! (N factorial)', inputLabel: 'N', inputMin: 3, inputMax: 20, defaultN: 10 },
  { value: 'staircase', label: 'Staircase', desc: 'Ways to climb N stairs (1 or 2 steps)', inputLabel: 'Stairs', inputMin: 5, inputMax: 25, defaultN: 15 },
  { value: 'coin-change', label: 'Coin Change', desc: 'Min coins to make amount N (coins: 1,3,5)', inputLabel: 'Amount', inputMin: 5, inputMax: 30, defaultN: 15 },
];

export interface RecursionStep {
  callCount: number;
  cacheHits: number;
  currentDepth: number;
  maxDepth: number;
  currentN: number;
  result: number | null;
  cacheSize: number;
}

export interface RecursionResult {
  steps: RecursionStep[];
  finalResult: number;
  totalCalls: number;
  totalCacheHits: number;
  maxDepth: number;
}

export function runNaiveFibonacci(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let maxDepth = 0;

  function fib(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    steps.push({
      callCount,
      cacheHits: 0,
      currentDepth: depth,
      maxDepth,
      currentN: k,
      result: null,
      cacheSize: 0,
    });

    if (k <= 1) {
      steps.push({
        callCount,
        cacheHits: 0,
        currentDepth: depth,
        maxDepth,
        currentN: k,
        result: k,
        cacheSize: 0,
      });
      return k;
    }

    const result = fib(k - 1, depth + 1) + fib(k - 2, depth + 1);
    steps.push({
      callCount,
      cacheHits: 0,
      currentDepth: depth,
      maxDepth,
      currentN: k,
      result,
      cacheSize: 0,
    });
    return result;
  }

  const finalResult = fib(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: 0, maxDepth };
}

export function runMemoizedFibonacci(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let cacheHits = 0;
  let maxDepth = 0;
  const cache: Map<number, number> = new Map();

  function fib(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);

    if (cache.has(k)) {
      cacheHits++;
      const cached = cache.get(k)!;
      steps.push({
        callCount,
        cacheHits,
        currentDepth: depth,
        maxDepth,
        currentN: k,
        result: cached,
        cacheSize: cache.size,
      });
      return cached;
    }

    steps.push({
      callCount,
      cacheHits,
      currentDepth: depth,
      maxDepth,
      currentN: k,
      result: null,
      cacheSize: cache.size,
    });

    if (k <= 1) {
      cache.set(k, k);
      steps.push({
        callCount,
        cacheHits,
        currentDepth: depth,
        maxDepth,
        currentN: k,
        result: k,
        cacheSize: cache.size,
      });
      return k;
    }

    const result = fib(k - 1, depth + 1) + fib(k - 2, depth + 1);
    cache.set(k, result);
    steps.push({
      callCount,
      cacheHits,
      currentDepth: depth,
      maxDepth,
      currentN: k,
      result,
      cacheSize: cache.size,
    });
    return result;
  }

  const finalResult = fib(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: cacheHits, maxDepth };
}

export function runIterativeFibonacci(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;

  if (n <= 1) {
    callCount = 1;
    steps.push({ callCount, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: n, result: n, cacheSize: 0 });
    return { steps, finalResult: n, totalCalls: 1, totalCacheHits: 0, maxDepth: 0 };
  }

  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    callCount++;
    const next = a + b;
    a = b;
    b = next;
    steps.push({
      callCount,
      cacheHits: 0,
      currentDepth: 0,
      maxDepth: 0,
      currentN: i,
      result: b,
      cacheSize: 0,
    });
  }

  return { steps, finalResult: b, totalCalls: callCount, totalCacheHits: 0, maxDepth: 0 };
}

export const REC_ALGORITHM_OPTIONS: { value: RecursionAlgorithm; label: string }[] = [
  { value: 'naive', label: 'Naive Recursive' },
  { value: 'memoized', label: 'Memoized' },
  { value: 'iterative', label: 'Iterative' },
];

export const REC_COMPLEXITY: Record<RecursionAlgorithm, { time: string; space: string }> = {
  naive:     { time: 'O(2ⁿ)', space: 'O(n)' },
  memoized:  { time: 'O(n)',   space: 'O(n)' },
  iterative: { time: 'O(n)',   space: 'O(1)' },
};

/* ───── Factorial ───── */
function runNaiveFactorial(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let maxDepth = 0;
  function fact(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result: null, cacheSize: 0 });
    if (k <= 1) {
      steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result: 1, cacheSize: 0 });
      return 1;
    }
    const result = k * fact(k - 1, depth + 1);
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result, cacheSize: 0 });
    return result;
  }
  const finalResult = fact(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: 0, maxDepth };
}

function runMemoizedFactorial(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let cacheHits = 0;
  let maxDepth = 0;
  const cache: Map<number, number> = new Map();
  function fact(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    if (cache.has(k)) {
      cacheHits++;
      const cached = cache.get(k)!;
      steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: cached, cacheSize: cache.size });
      return cached;
    }
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: null, cacheSize: cache.size });
    if (k <= 1) { cache.set(k, 1); steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: 1, cacheSize: cache.size }); return 1; }
    const result = k * fact(k - 1, depth + 1);
    cache.set(k, result);
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result, cacheSize: cache.size });
    return result;
  }
  const finalResult = fact(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: cacheHits, maxDepth };
}

function runIterativeFactorial(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    steps.push({ callCount: i - 1, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: i, result, cacheSize: 0 });
  }
  if (steps.length === 0) steps.push({ callCount: 1, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: n, result: 1, cacheSize: 0 });
  return { steps, finalResult: result, totalCalls: Math.max(n - 1, 1), totalCacheHits: 0, maxDepth: 0 };
}

/* ───── Staircase Climbing ───── */
function runNaiveStaircase(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let maxDepth = 0;
  function climb(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result: null, cacheSize: 0 });
    if (k <= 1) {
      steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result: 1, cacheSize: 0 });
      return 1;
    }
    const result = climb(k - 1, depth + 1) + climb(k - 2, depth + 1);
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: k, result, cacheSize: 0 });
    return result;
  }
  const finalResult = climb(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: 0, maxDepth };
}

function runMemoizedStaircase(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let cacheHits = 0;
  let maxDepth = 0;
  const cache: Map<number, number> = new Map();
  function climb(k: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    if (cache.has(k)) {
      cacheHits++;
      const cached = cache.get(k)!;
      steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: cached, cacheSize: cache.size });
      return cached;
    }
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: null, cacheSize: cache.size });
    if (k <= 1) { cache.set(k, 1); steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result: 1, cacheSize: cache.size }); return 1; }
    const result = climb(k - 1, depth + 1) + climb(k - 2, depth + 1);
    cache.set(k, result);
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: k, result, cacheSize: cache.size });
    return result;
  }
  const finalResult = climb(n, 0);
  return { steps, finalResult, totalCalls: callCount, totalCacheHits: cacheHits, maxDepth };
}

function runIterativeStaircase(n: number): RecursionResult {
  const steps: RecursionStep[] = [];
  if (n <= 1) {
    steps.push({ callCount: 1, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: n, result: 1, cacheSize: 0 });
    return { steps, finalResult: 1, totalCalls: 1, totalCacheHits: 0, maxDepth: 0 };
  }
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) {
    const next = a + b;
    a = b; b = next;
    steps.push({ callCount: i - 1, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: i, result: b, cacheSize: 0 });
  }
  return { steps, finalResult: b, totalCalls: n - 1, totalCacheHits: 0, maxDepth: 0 };
}

/* ───── Coin Change (coins: 1, 3, 5) ───── */
const COINS = [1, 3, 5];

function runNaiveCoinChange(amount: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let maxDepth = 0;
  function minCoins(amt: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: amt, result: null, cacheSize: 0 });
    if (amt === 0) { steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: amt, result: 0, cacheSize: 0 }); return 0; }
    if (amt < 0) { steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: amt, result: Infinity, cacheSize: 0 }); return Infinity; }
    let best = Infinity;
    for (const c of COINS) {
      const sub = minCoins(amt - c, depth + 1);
      if (sub !== Infinity) best = Math.min(best, sub + 1);
    }
    steps.push({ callCount, cacheHits: 0, currentDepth: depth, maxDepth, currentN: amt, result: best === Infinity ? -1 : best, cacheSize: 0 });
    return best;
  }
  const finalResult = minCoins(amount, 0);
  return { steps, finalResult: finalResult === Infinity ? -1 : finalResult, totalCalls: callCount, totalCacheHits: 0, maxDepth };
}

function runMemoizedCoinChange(amount: number): RecursionResult {
  const steps: RecursionStep[] = [];
  let callCount = 0;
  let cacheHits = 0;
  let maxDepth = 0;
  const cache: Map<number, number> = new Map();
  function minCoins(amt: number, depth: number): number {
    callCount++;
    maxDepth = Math.max(maxDepth, depth);
    if (cache.has(amt)) {
      cacheHits++;
      const cached = cache.get(amt)!;
      steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: amt, result: cached === Infinity ? -1 : cached, cacheSize: cache.size });
      return cached;
    }
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: amt, result: null, cacheSize: cache.size });
    if (amt === 0) { cache.set(0, 0); steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: amt, result: 0, cacheSize: cache.size }); return 0; }
    if (amt < 0) { return Infinity; }
    let best = Infinity;
    for (const c of COINS) {
      const sub = minCoins(amt - c, depth + 1);
      if (sub !== Infinity) best = Math.min(best, sub + 1);
    }
    cache.set(amt, best);
    steps.push({ callCount, cacheHits, currentDepth: depth, maxDepth, currentN: amt, result: best === Infinity ? -1 : best, cacheSize: cache.size });
    return best;
  }
  const finalResult = minCoins(amount, 0);
  return { steps, finalResult: finalResult === Infinity ? -1 : finalResult, totalCalls: callCount, totalCacheHits: cacheHits, maxDepth };
}

function runIterativeCoinChange(amount: number): RecursionResult {
  const steps: RecursionStep[] = [];
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  let callCount = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of COINS) {
      if (i >= c && dp[i - c] + 1 < dp[i]) dp[i] = dp[i - c] + 1;
    }
    callCount++;
    steps.push({ callCount, cacheHits: 0, currentDepth: 0, maxDepth: 0, currentN: i, result: dp[i] === Infinity ? -1 : dp[i], cacheSize: 0 });
  }
  return { steps, finalResult: dp[amount] === Infinity ? -1 : dp[amount], totalCalls: callCount, totalCacheHits: 0, maxDepth: 0 };
}

export function runRecursionAlgorithm(alg: RecursionAlgorithm, n: number, problem: RecursionProblem = 'fibonacci'): RecursionResult {
  switch (problem) {
    case 'fibonacci':
      switch (alg) { case 'naive': return runNaiveFibonacci(n); case 'memoized': return runMemoizedFibonacci(n); case 'iterative': return runIterativeFibonacci(n); }
      break; // eslint-disable-line no-fallthrough
    case 'factorial':
      switch (alg) { case 'naive': return runNaiveFactorial(n); case 'memoized': return runMemoizedFactorial(n); case 'iterative': return runIterativeFactorial(n); }
      break;
    case 'staircase':
      switch (alg) { case 'naive': return runNaiveStaircase(n); case 'memoized': return runMemoizedStaircase(n); case 'iterative': return runIterativeStaircase(n); }
      break;
    case 'coin-change':
      switch (alg) { case 'naive': return runNaiveCoinChange(n); case 'memoized': return runMemoizedCoinChange(n); case 'iterative': return runIterativeCoinChange(n); }
      break;
  }
  return runNaiveFibonacci(n);
}
