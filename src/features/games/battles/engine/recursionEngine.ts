export type RecursionAlgorithm = 'naive' | 'memoized' | 'iterative';

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

export function runRecursionAlgorithm(alg: RecursionAlgorithm, n: number): RecursionResult {
  switch (alg) {
    case 'naive': return runNaiveFibonacci(n);
    case 'memoized': return runMemoizedFibonacci(n);
    case 'iterative': return runIterativeFibonacci(n);
  }
}
