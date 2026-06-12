import type { LLProblem, LLStep, LLVisNode } from '../types/linkedListAlgo';

// ---------------------------------------------------------------------------
// Pure step-builders. Each problem turns an input string into LLStep[].
// No React, no DOM — fully unit-testable.
// ---------------------------------------------------------------------------

let nodeSeq = 1;
function freshNodes(values: number[]): LLVisNode[] {
  return values.map((value) => ({ id: nodeSeq++, value }));
}

function parseNumbers(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

/** Deep-ish clone of nodes so each step snapshots its own immutable array. */
function snap(nodes: LLVisNode[]): LLVisNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function buildLinkedListSteps(problem: LLProblem, input: string): LLStep[] {
  switch (problem) {
    case 'find-middle':
      return findMiddleSteps(parseNumbers(input));
    case 'reverse-list':
      return reverseListSteps(parseNumbers(input));
    case 'add-two-numbers':
      return addTwoNumbersSteps(input);
    case 'reverse-k-group':
      return reverseKGroupSteps(input);
    case 'palindrome':
      return palindromeSteps(parseNumbers(input));
    case 'lru-cache':
      return lruSteps(input);
    case 'segregate':
      return segregateSteps(parseNumbers(input));
    case 'detect-cycle':
      return detectCycleSteps(input);
    case 'sort-list':
      return sortListSteps(parseNumbers(input));
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// 1. Find Middle — tortoise & hare
// ---------------------------------------------------------------------------
function findMiddleSteps(values: number[]): LLStep[] {
  const nodes = freshNodes(values);
  const steps: LLStep[] = [];
  const n = nodes.length;

  if (n === 0) {
    return [{ description: 'List is empty — no middle.', event: 'not-found', nodes: [], pointers: [], highlights: [], done: true }];
  }

  steps.push({
    description: 'Set slow = head (index 0).',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'slow', index: 0, color: 'green' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['slow = head'],
    codeLine: 1,
  });
  steps.push({
    description: 'Set fast = head (index 0). Both pointers start together.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [
      { name: 'slow', index: 0, color: 'green' },
      { name: 'fast', index: 0, color: 'red' },
    ],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['slow = head', 'fast = head'],
    codeLine: 2,
  });

  let slow = 0;
  let fast = 0;
  // Tortoise & hare: advance while fast can take two real steps.
  while (fast + 2 <= n - 1) {
    // line 3 — loop condition holds
    steps.push({
      description: `Loop check: fast can move two nodes ahead (fast at index ${fast}). Enter the loop.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      meta: [`slow = ${slow}`, `fast = ${fast}`],
      codeLine: 3,
    });
    // line 4 — slow advances one
    slow += 1;
    steps.push({
      description: `slow = slow.next → index ${slow} (value ${nodes[slow].value}). slow walks 1 step.`,
      event: 'visit',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      meta: [`slow = ${slow}`, `fast = ${fast}`],
      codeLine: 4,
    });
    // line 5 — fast advances two
    fast += 2;
    steps.push({
      description: `fast = fast.next.next → index ${fast} (value ${nodes[fast].value}). fast walks 2 steps.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      meta: [`slow = ${slow}`, `fast = ${fast}`],
      codeLine: 5,
    });
  }
  // One more slow step if fast still has a single node ahead (even length).
  if (fast + 1 === n - 1) {
    steps.push({
      description: `Loop check: fast has a single node ahead — take one more paired step.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      meta: [`slow = ${slow}`, `fast = ${fast}`],
      codeLine: 3,
    });
    slow += 1;
    fast += 1;
    steps.push({
      description: `slow → ${slow} (${nodes[slow].value}); fast → ${fast} (${nodes[fast].value}).`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      meta: [`slow = ${slow}`, `fast = ${fast}`],
      codeLine: 5,
    });
  }

  steps.push({
    description: `fast reached the end, so slow stops at the middle: index ${slow}, value ${nodes[slow].value}.`,
    event: 'found',
    nodes: snap(nodes),
    pointers: [{ name: 'middle', index: slow, color: 'green' }],
    highlights: [{ index: slow, color: 'green' }],
    meta: [`middle index = ${slow}`, `middle value = ${nodes[slow].value}`],
    codeLine: 6,
    done: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 1b. Reverse a Linked List — iterative prev / curr / next
// ---------------------------------------------------------------------------
function reverseListSteps(values: number[]): LLStep[] {
  const nodes = freshNodes(values);
  const n = nodes.length;

  if (n === 0) {
    return [{ description: 'List is empty — nothing to reverse.', event: 'complete', nodes: [], pointers: [], highlights: [], done: true }];
  }
  if (n === 1) {
    return [{
      description: 'Single node — reversing leaves it unchanged.',
      event: 'complete', nodes: snap(nodes), pointers: [{ name: 'head', index: 0, color: 'green' }],
      highlights: [{ index: 0, color: 'green' }], codeLine: 8, done: true,
    }];
  }

  const steps: LLStep[] = [];
  steps.push({
    description: 'Set prev = null. This will become the new head once we finish.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['prev = null'],
    codeLine: 1,
  });
  steps.push({
    description: 'Set curr = head. We walk the list once, flipping each next pointer to point backwards.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['prev = null', 'curr = head'],
    codeLine: 2,
  });

  // `processed` holds the already-reversed nodes (head-first = most-recent first).
  // The conceptual list at any moment is `processed` followed by the untouched tail.
  const processed: LLVisNode[] = [];
  for (let i = 0; i < n; i += 1) {
    const node = nodes[i];
    // visual order BEFORE flip: reversed(processed) ++ remaining(nodes[i..])
    const before = [...processed].reverse().concat(nodes.slice(i));
    const currIdxBefore = processed.length; // curr sits right after the reversed prefix
    const prevPointer = processed.length
      ? [{ name: 'prev', index: currIdxBefore - 1, color: 'green' as const }]
      : [];
    const nextPointer = i + 1 < n
      ? [{ name: 'next', index: currIdxBefore + 1, color: 'red' as const }]
      : [];

    // line 3 — loop condition (curr is non-null)
    steps.push({
      description: `Loop check: curr = ${node.value} (not null) → enter the loop.`,
      event: 'compare',
      nodes: snap(before),
      pointers: [...prevPointer, { name: 'curr', index: currIdxBefore, color: 'yellow' as const }],
      highlights: [{ index: currIdxBefore, color: 'yellow' }],
      meta: [`reversed = [${[...processed].reverse().map((p) => p.value).join(', ')}]`],
      codeLine: 3,
    });
    // line 4 — remember next
    steps.push({
      description: `Remember next = ${i + 1 < n ? nodes[i + 1].value : 'null'} before we overwrite curr.next.`,
      event: 'visit',
      nodes: snap(before),
      pointers: [...prevPointer, { name: 'curr', index: currIdxBefore, color: 'yellow' as const }, ...nextPointer],
      highlights: [{ index: currIdxBefore, color: 'yellow' }],
      meta: [`reversed = [${[...processed].reverse().map((p) => p.value).join(', ')}]`],
      codeLine: 4,
    });
    // line 5 — flip the link
    steps.push({
      description: `Flip curr (${node.value}) → point at prev (${processed.length ? processed[processed.length - 1].value : 'null'}).`,
      event: 'swap',
      nodes: snap(before),
      pointers: [...prevPointer, { name: 'curr', index: currIdxBefore, color: 'yellow' as const }, ...nextPointer],
      highlights: [{ index: currIdxBefore, color: 'yellow' }],
      meta: [`reversed = [${[...processed].reverse().map((p) => p.value).join(', ')}]`],
      codeLine: 5,
    });

    // perform the flip: node becomes the new front of the reversed chain
    processed.push(node);
    const after = [...processed].reverse().concat(nodes.slice(i + 1));
    // line 6 — advance prev
    steps.push({
      description: `Advance prev = ${node.value}. Reversed prefix is now [${[...processed].reverse().map((p) => p.value).join(', ')}].`,
      event: 'visit',
      nodes: snap(after),
      pointers: [
        { name: 'prev', index: 0, color: 'green' },
        ...(i + 1 < n ? [{ name: 'curr', index: processed.length, color: 'yellow' as const }] : []),
      ],
      highlights: [{ index: 0, color: 'green' }],
      meta: [`reversed = [${[...processed].reverse().map((p) => p.value).join(', ')}]`],
      codeLine: 6,
    });
    // line 7 — advance curr
    steps.push({
      description: `Advance curr = ${i + 1 < n ? nodes[i + 1].value : 'null'}.`,
      event: 'visit',
      nodes: snap(after),
      pointers: [
        { name: 'prev', index: 0, color: 'green' },
        ...(i + 1 < n ? [{ name: 'curr', index: processed.length, color: 'yellow' as const }] : []),
      ],
      highlights: [{ index: 0, color: 'green' }],
      meta: [`reversed = [${[...processed].reverse().map((p) => p.value).join(', ')}]`],
      codeLine: 7,
    });
  }

  const reversed = [...processed].reverse();
  steps.push({
    description: `curr is null → done. prev is the new head. Reversed list: [${reversed.map((r) => r.value).join(', ')}]. ✓`,
    event: 'complete',
    nodes: snap(reversed),
    pointers: [{ name: 'head', index: 0, color: 'green' }],
    highlights: reversed.map((_, i) => ({ index: i, color: 'green' as const })),
    codeLine: 8,
    done: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 1c. Add Two Numbers — digits stored least-significant-first, add with carry
// ---------------------------------------------------------------------------
function addTwoNumbersSteps(input: string): LLStep[] {
  const [aRaw = '0', bRaw = '0'] = input.split(';');
  const numA = Math.abs(Math.trunc(Number(aRaw.trim()) || 0));
  const numB = Math.abs(Math.trunc(Number(bRaw.trim()) || 0));

  // least-significant digit first (mirrors the classic LeetCode representation)
  const digitsOf = (num: number): number[] => String(num).split('').map(Number).reverse();
  const a = digitsOf(numA);
  const b = digitsOf(numB);

  const steps: LLStep[] = [];
  const result: LLVisNode[] = [];
  const aStr = `A = ${a.join('→')} (=${numA})`;
  const bStr = `B = ${b.join('→')} (=${numB})`;

  steps.push({
    description: `Add ${numA} + ${numB}. Digits are stored least-significant-first, so we add node by node from the front, carrying overflow.`,
    event: 'visit',
    nodes: [],
    pointers: [],
    highlights: [],
    meta: [aStr, bStr, 'carry = 0'],
    codeLine: 1,
  });
  steps.push({
    description: 'Initialise carry = 0 before walking both digit lists.',
    event: 'visit',
    nodes: [],
    pointers: [],
    highlights: [],
    meta: [aStr, bStr, 'carry = 0'],
    codeLine: 2,
  });

  let carry = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len || carry > 0; i += 1) {
    const da = a[i] ?? 0;
    const db = b[i] ?? 0;
    const carryIn = carry;
    const hasA = i < a.length;
    const hasB = i < b.length;
    const tailIndex = result.length - 1; // tail position so far (-1 before first push)
    const tailPointer = tailIndex >= 0 ? [{ name: 'tail', index: tailIndex, color: 'green' as const }] : [];
    const tailHighlight = tailIndex >= 0 ? [{ index: tailIndex, color: 'blue' as const }] : [];

    // line 3 — loop condition check
    steps.push({
      description: `Loop check: ${hasA ? 'A has a digit' : 'A exhausted'}, ${hasB ? 'B has a digit' : 'B exhausted'}, carry = ${carryIn}. Continue.`,
      event: 'visit',
      nodes: snap(result),
      pointers: tailPointer,
      highlights: tailHighlight,
      meta: [aStr, bStr, `carry = ${carryIn}`],
      codeLine: 3,
    });

    // line 4 — sum = carry
    let sum = carryIn;
    steps.push({
      description: `Start this position's sum with the incoming carry: sum = ${carryIn}.`,
      event: 'visit',
      nodes: snap(result),
      pointers: tailPointer,
      highlights: tailHighlight,
      meta: [aStr, bStr, `sum = ${sum}`, `carry = ${carryIn}`],
      codeLine: 4,
    });

    // line 5 — add A's digit
    sum += da;
    steps.push({
      description: hasA
        ? `A has digit ${da} at this position → sum += ${da} = ${sum}; advance A.`
        : `A is exhausted at this position → nothing to add. sum = ${sum}.`,
      event: 'compare',
      nodes: snap(result),
      pointers: tailPointer,
      highlights: tailHighlight,
      meta: [aStr, bStr, `sum = ${sum}`, `carry = ${carryIn}`],
      codeLine: 5,
    });

    // line 6 — add B's digit
    sum += db;
    steps.push({
      description: hasB
        ? `B has digit ${db} at this position → sum += ${db} = ${sum}; advance B.`
        : `B is exhausted at this position → nothing to add. sum = ${sum}.`,
      event: 'compare',
      nodes: snap(result),
      pointers: tailPointer,
      highlights: tailHighlight,
      meta: [aStr, bStr, `sum = ${sum}`, `carry = ${carryIn}`],
      codeLine: 6,
    });

    // line 7 — compute new carry
    carry = Math.floor(sum / 10);
    const digit = sum % 10;
    steps.push({
      description: `carry = floor(${sum} / 10) = ${carry}.`,
      event: 'compare',
      nodes: snap(result),
      pointers: tailPointer,
      highlights: tailHighlight,
      meta: [aStr, bStr, `sum = ${sum}`, `carry = ${carry}`],
      codeLine: 7,
    });

    // line 8 — append the new digit node
    result.push({ id: nodeSeq++, value: digit });
    steps.push({
      description: `Append a node with digit sum % 10 = ${digit}.`,
      event: 'push',
      nodes: snap(result),
      pointers: [{ name: 'tail', index: result.length - 1, color: 'green' }],
      highlights: [{ index: result.length - 1, color: 'green' }],
      meta: [aStr, bStr, `sum = ${sum}`, `carry = ${carry}`],
      codeLine: 8,
    });

    // line 9 — advance tail
    steps.push({
      description: `Advance tail to the node just appended (digit ${digit}).`,
      event: 'visit',
      nodes: snap(result),
      pointers: [{ name: 'tail', index: result.length - 1, color: 'green' }],
      highlights: [{ index: result.length - 1, color: 'blue' }],
      meta: [aStr, bStr, `carry = ${carry}`],
      codeLine: 9,
    });
  }

  const total = numA + numB;
  steps.push({
    description: `Done. Result list (least-significant-first): [${result.map((r) => r.value).join(', ')}] = ${total}. ✓`,
    event: 'complete',
    nodes: snap(result),
    pointers: [{ name: 'head', index: 0, color: 'green' }],
    highlights: result.map((_, i) => ({ index: i, color: 'green' as const })),
    meta: [aStr, bStr, `${numA} + ${numB} = ${total}`],
    codeLine: 10,
    done: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 1d. Reverse Nodes in k-Group — iterative, leaves a trailing partial group
// ---------------------------------------------------------------------------
function reverseKGroupSteps(input: string): LLStep[] {
  const [valuesRaw = '', kRaw = '2'] = input.split(';');
  const values = parseNumbers(valuesRaw);
  const nodes = freshNodes(values);
  const n = nodes.length;
  const k = Math.max(1, Math.trunc(Number(kRaw.trim()) || 2));

  if (n === 0) {
    return [{ description: 'List is empty — nothing to reverse.', event: 'complete', nodes: [], pointers: [], highlights: [], done: true }];
  }

  const steps: LLStep[] = [];
  // `order` is the live visual ordering; we reverse slices in place per group.
  const order = nodes.slice();

  steps.push({
    description: `Reverse the list in groups of k = ${k}. Each full block of ${k} nodes is reversed; a trailing group with fewer than ${k} nodes is left untouched.`,
    event: 'visit',
    nodes: snap(order),
    pointers: [],
    highlights: order.map((_, i) => ({ index: i, color: 'blue' as const })),
    meta: [`k = ${k}`, `length = ${n}`],
    codeLine: 0,
  });

  let g = 0;
  let groupNo = 0;
  while (g + k <= n) {
    groupNo += 1;
    // line 3 — while true (we have a group to process)
    steps.push({
      description: `Group ${groupNo}: look k = ${k} nodes ahead from index ${g}.`,
      event: 'recurse',
      nodes: snap(order),
      pointers: [{ name: 'start', index: g, color: 'green' }],
      highlights: range(g, Math.min(g + k, n)).map((i) => ({ index: i, color: 'blue' as const })),
      meta: [`group ${groupNo}`],
      codeLine: 3,
    });
    // line 4 — find kth node
    steps.push({
      description: `kth node of this group is at index ${g + k - 1} (value ${order[g + k - 1].value}).`,
      event: 'compare',
      nodes: snap(order),
      pointers: [
        { name: 'start', index: g, color: 'green' },
        { name: 'kth', index: g + k - 1, color: 'red' },
      ],
      highlights: range(g, g + k).map((i) => ({ index: i, color: 'yellow' as const })),
      meta: [`group ${groupNo}`],
      codeLine: 4,
    });
    // line 8 — begin reversing the group in place
    steps.push({
      description: `Full block of ${k} found → reverse indices ${g}…${g + k - 1} in place.`,
      event: 'visit',
      nodes: snap(order),
      pointers: [
        { name: 'start', index: g, color: 'green' },
        { name: 'kth', index: g + k - 1, color: 'red' },
      ],
      highlights: range(g, g + k).map((i) => ({ index: i, color: 'yellow' as const })),
      codeLine: 8,
    });

    // Iterative two-pointer reversal of order[g .. g+k), one swap per step.
    let i = g;
    let j = g + k - 1;
    while (i < j) {
      // line 9 — inner loop condition
      steps.push({
        description: `Reverse loop: pointers at indices ${i} and ${j} have not met — keep going.`,
        event: 'compare',
        nodes: snap(order),
        pointers: [
          { name: 'i', index: i, color: 'green' },
          { name: 'j', index: j, color: 'red' },
        ],
        highlights: [{ index: i, color: 'yellow' }, { index: j, color: 'yellow' }],
        codeLine: 9,
      });
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
      // line 10 — flip the links (modelled as a swap of the two ends)
      steps.push({
        description: `Reverse step: swap nodes at indices ${i} (${order[i].value}) and ${j} (${order[j].value}).`,
        event: 'swap',
        nodes: snap(order),
        pointers: [
          { name: 'i', index: i, color: 'green' },
          { name: 'j', index: j, color: 'red' },
        ],
        highlights: [{ index: i, color: 'green' }, { index: j, color: 'red' }],
        codeLine: 10,
      });
      i += 1;
      j -= 1;
      // line 11 — advance the reversal pointers
      steps.push({
        description: `Advance reversal pointers inward → indices ${i} and ${j}.`,
        event: 'visit',
        nodes: snap(order),
        pointers: i <= j
          ? [{ name: 'i', index: i, color: 'green' }, { name: 'j', index: j, color: 'red' }]
          : [],
        highlights: range(g, g + k).map((idx) => ({ index: idx, color: 'yellow' as const })),
        codeLine: 11,
      });
    }

    // line 13 — relink the reversed group into the result
    steps.push({
      description: `Group ${groupNo} reversed → [${order.slice(g, g + k).map((o) => o.value).join(', ')}]. Relink it and move groupPrev forward.`,
      event: 'visit',
      nodes: snap(order),
      pointers: [],
      highlights: range(g, g + k).map((idx) => ({ index: idx, color: 'purple' as const })),
      codeLine: 13,
    });

    g += k;
  }

  if (g < n) {
    // line 3 — loop check, then line 5 — kth is null, break
    steps.push({
      description: `Look k = ${k} nodes ahead from index ${g}…`,
      event: 'compare',
      nodes: snap(order),
      pointers: [{ name: 'rest', index: g, color: 'yellow' }],
      highlights: range(g, n).map((idx) => ({ index: idx, color: 'blue' as const })),
      codeLine: 4,
    });
    steps.push({
      description: `Remaining indices ${g}…${n - 1} are fewer than k = ${k} — kth is null, so break and leave them as-is.`,
      event: 'compare',
      nodes: snap(order),
      pointers: [{ name: 'rest', index: g, color: 'yellow' }],
      highlights: range(g, n).map((idx) => ({ index: idx, color: 'blue' as const })),
      codeLine: 5,
    });
  }

  steps.push({
    description: `Done. Result: [${order.map((o) => o.value).join(', ')}]. ✓`,
    event: 'complete',
    nodes: snap(order),
    pointers: [{ name: 'head', index: 0, color: 'green' }],
    highlights: order.map((_, i) => ({ index: i, color: 'green' as const })),
    codeLine: 14,
    done: true,
  });

  return steps;
}


function palindromeSteps(values: number[]): LLStep[] {
  const nodes = freshNodes(values);
  const steps: LLStep[] = [];
  const n = nodes.length;

  if (n === 0) {
    return [{ description: 'Empty list is trivially a palindrome.', event: 'found', nodes: [], pointers: [], highlights: [], done: true }];
  }

  steps.push({
    description: 'Phase 1 — find the middle with slow (1×) and fast (2×) pointers.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [
      { name: 'slow', index: 0, color: 'green' },
      { name: 'fast', index: 0, color: 'red' },
    ],
    highlights: [{ index: 0, color: 'blue' }],
    codeLine: 2,
  });

  let slow = 0;
  let fast = 0;
  while (fast + 2 <= n - 1) {
    // line 3 — loop condition
    steps.push({
      description: `Loop check: fast can move two nodes ahead (fast at index ${fast}). Continue scanning for the middle.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      codeLine: 3,
    });
    // line 4 — advance both
    slow += 1;
    fast += 2;
    steps.push({
      description: `Advance: slow → ${slow} (${nodes[slow].value}), fast → ${fast} (${nodes[fast].value}).`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      codeLine: 4,
    });
  }
  // For odd length, the middle element is skipped; second half starts at slow+1.
  const secondStart = n % 2 === 0 ? slow + 1 : slow + 1;

  steps.push({
    description: `Middle found at index ${slow}. The second half (indices ${secondStart}…${n - 1}) will be reversed.`,
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'mid', index: slow, color: 'yellow' }],
    highlights: Array.from({ length: n - secondStart }, (_, i) => ({ index: secondStart + i, color: 'purple' as const })),
    meta: ['Phase 2 — reverse 2nd half'],
    codeLine: 6,
  });

  // Reverse the second half by physically reordering the snapshot array so the
  // visual order matches the reversed pointers (head…mid stay; tail half flips).
  const head = nodes.slice(0, secondStart);
  const tail = nodes.slice(secondStart).reverse();
  const reordered = [...head, ...tail];

  steps.push({
    description: 'Second half reversed. Set p = head, q = second (start of reversed half). Compare moving inward.',
    event: 'swap',
    nodes: snap(reordered),
    pointers: [
      { name: 'p', index: 0, color: 'green' },
      { name: 'q', index: secondStart, color: 'red' },
    ],
    highlights: Array.from({ length: tail.length }, (_, i) => ({ index: head.length + i, color: 'purple' as const })),
    codeLine: 8,
  });

  let left = 0;
  let right = secondStart;
  let isPalindrome = true;
  const compareCount = tail.length;
  for (let k = 0; k < compareCount; k += 1) {
    left = k;
    right = secondStart + k;
    const a = reordered[left].value;
    const b = reordered[right].value;
    const match = a === b;
    // line 9 — loop condition (q still valid)
    steps.push({
      description: `Loop check: q points at index ${right} (still within the reversed half) — compare this pair.`,
      event: 'compare',
      nodes: snap(reordered),
      pointers: [
        { name: 'p', index: left, color: 'green' },
        { name: 'q', index: right, color: 'red' },
      ],
      highlights: [{ index: left, color: 'yellow' }, { index: right, color: 'yellow' }],
      codeLine: 9,
    });
    // line 10 — compare values
    steps.push({
      description: `Compare p[${left}] = ${a} with q[${right}] = ${b} → ${match ? 'match ✓' : 'mismatch ✗ → return false'}.`,
      event: match ? 'compare' : 'not-found',
      nodes: snap(reordered),
      pointers: [
        { name: 'p', index: left, color: 'green' },
        { name: 'q', index: right, color: 'red' },
      ],
      highlights: [
        { index: left, color: match ? 'green' : 'red' },
        { index: right, color: match ? 'green' : 'red' },
      ],
      codeLine: 10,
    });
    if (!match) { isPalindrome = false; break; }
    // line 11 — advance both pointers
    if (k + 1 < compareCount) {
      steps.push({
        description: `Match — advance p → ${left + 1}, q → ${right + 1}.`,
        event: 'visit',
        nodes: snap(reordered),
        pointers: [
          { name: 'p', index: left + 1, color: 'green' },
          { name: 'q', index: right + 1, color: 'red' },
        ],
        highlights: [{ index: left + 1, color: 'yellow' }, { index: right + 1, color: 'yellow' }],
        codeLine: 11,
      });
    }
  }

  steps.push({
    description: isPalindrome
      ? 'All pairs matched — the list IS a palindrome. ✓'
      : 'A pair mismatched — the list is NOT a palindrome. ✗',
    event: isPalindrome ? 'found' : 'not-found',
    nodes: snap(reordered),
    pointers: [],
    highlights: reordered.map((_, i) => ({ index: i, color: isPalindrome ? 'green' as const : 'red' as const })),
    meta: [isPalindrome ? 'palindrome = true' : 'palindrome = false'],
    codeLine: isPalindrome ? 12 : 10,
    done: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 3. LRU Cache — get / put
// ---------------------------------------------------------------------------
interface LRUEntry { key: number; value: number; }

function lruSteps(input: string): LLStep[] {
  const [capRaw, opsRaw = ''] = input.split(';');
  const capacity = Math.max(1, Number(capRaw.trim()) || 1);
  const ops = opsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const steps: LLStep[] = [];
  let entries: LRUEntry[] = []; // index 0 = most recently used

  const emit = (description: string, event: LLStep['event'], view: Partial<LLStep['lru']> = {}, codeLine?: number, done = false) => {
    steps.push({
      description,
      event,
      nodes: [],
      pointers: [],
      highlights: [],
      lru: {
        capacity,
        entries: entries.map((e) => ({ ...e })),
        op: view?.op,
        hitKey: view?.hitKey ?? null,
        missKey: view?.missKey ?? null,
        evictKey: view?.evictKey ?? null,
      },
      meta: [`capacity = ${capacity}`, `size = ${entries.length}`],
      codeLine,
      done,
    });
  };

  emit(`Create an LRU cache with capacity ${capacity}. The front is most-recently-used, the back is least-recently-used.`, 'visit', { op: 'init' }, 0);

  for (const op of ops) {
    const parts = op.split(/\s+/);
    const kind = parts[0]?.toLowerCase();

    if (kind === 'put') {
      const key = Number(parts[1]);
      const value = Number(parts[2]);
      const existing = entries.findIndex((e) => e.key === key);
      if (existing >= 0) {
        const [moved] = entries.splice(existing, 1);
        moved.value = value;
        entries.unshift(moved);
        emit(`put(${key}, ${value}): key ${key} already exists → update value and move to front (most-recently-used).`, 'swap', { op: `put ${key} ${value}`, hitKey: key }, 11);
      } else {
        if (entries.length >= capacity) {
          const evicted = entries[entries.length - 1];
          emit(`put(${key}, ${value}): cache is full → evict least-recently-used key ${evicted.key}.`, 'pop', { op: `put ${key} ${value}`, evictKey: evicted.key }, 13);
          entries = entries.slice(0, entries.length - 1);
        }
        entries.unshift({ key, value });
        emit(`put(${key}, ${value}): insert new entry at the front.`, 'push', { op: `put ${key} ${value}`, hitKey: key }, 14);
      }
    } else if (kind === 'get') {
      const key = Number(parts[1]);
      const idx = entries.findIndex((e) => e.key === key);
      if (idx >= 0) {
        const [moved] = entries.splice(idx, 1);
        entries.unshift(moved);
        emit(`get(${key}) → ${moved.value} (HIT). Move key ${key} to the front.`, 'found', { op: `get ${key}`, hitKey: key }, 6);
      } else {
        emit(`get(${key}) → -1 (MISS). Key ${key} is not in the cache.`, 'not-found', { op: `get ${key}`, missKey: key }, 5);
      }
    }
  }

  emit('All operations processed.', 'complete', { op: 'done' }, 0, true);
  return steps;
}

// ---------------------------------------------------------------------------
// 4. Segregate Even and Odd
// ---------------------------------------------------------------------------
function segregateSteps(values: number[]): LLStep[] {
  const nodes = freshNodes(values);
  const steps: LLStep[] = [];
  const n = nodes.length;

  if (n === 0) {
    return [{ description: 'List is empty — nothing to segregate.', event: 'complete', nodes: [], pointers: [], highlights: [], done: true }];
  }

  steps.push({
    description: 'Goal: move all even-valued nodes before all odd-valued nodes, preserving relative order. Scan from the head.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['evens = [ ]', 'odds = [ ]'],
    codeLine: 0,
  });

  steps.push({
    description: 'Create an empty evens chain to collect even-valued nodes.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['evens = [ ]'],
    codeLine: 1,
  });
  steps.push({
    description: 'Create an empty odds chain to collect odd-valued nodes.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['evens = [ ]', 'odds = [ ]'],
    codeLine: 2,
  });
  steps.push({
    description: 'Set curr = head and scan the list once.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'curr', index: 0, color: 'yellow' }],
    highlights: [{ index: 0, color: 'blue' }],
    meta: ['evens = [ ]', 'odds = [ ]'],
    codeLine: 3,
  });

  const evens: LLVisNode[] = [];
  const odds: LLVisNode[] = [];
  for (let i = 0; i < n; i += 1) {
    const node = nodes[i];
    const isEven = node.value % 2 === 0;
    // line 4 — loop condition
    steps.push({
      description: `Loop check: curr = ${node.value} (index ${i}) is not null — process it.`,
      event: 'visit',
      nodes: snap(nodes),
      pointers: [{ name: 'curr', index: i, color: 'yellow' }],
      highlights: [{ index: i, color: 'blue' }],
      meta: [`evens = [${evens.map((e) => e.value).join(', ')}]`, `odds = [${odds.map((o) => o.value).join(', ')}]`],
      codeLine: 4,
    });
    // line 5/6 — classify and append
    if (isEven) evens.push(node); else odds.push(node);
    steps.push({
      description: `Node ${node.value} is ${isEven ? 'EVEN → append to evens chain' : 'ODD → append to odds chain'}.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [{ name: 'curr', index: i, color: 'yellow' }],
      highlights: [{ index: i, color: isEven ? 'green' : 'red' }],
      meta: [`evens = [${evens.map((e) => e.value).join(', ')}]`, `odds = [${odds.map((o) => o.value).join(', ')}]`],
      codeLine: isEven ? 5 : 6,
    });
    // line 7 — advance
    steps.push({
      description: i + 1 < n
        ? `Advance curr → index ${i + 1} (value ${nodes[i + 1].value}).`
        : 'Advance curr → null. Scan complete.',
      event: 'visit',
      nodes: snap(nodes),
      pointers: i + 1 < n ? [{ name: 'curr', index: i + 1, color: 'yellow' }] : [],
      highlights: i + 1 < n ? [{ index: i + 1, color: 'blue' }] : [],
      meta: [`evens = [${evens.map((e) => e.value).join(', ')}]`, `odds = [${odds.map((o) => o.value).join(', ')}]`],
      codeLine: 7,
    });
  }

  const merged = [...evens, ...odds];
  steps.push({
    description: `Join the chains: evens (${evens.length}) followed by odds (${odds.length}).`,
    event: 'swap',
    nodes: snap(merged),
    pointers: [],
    highlights: merged.map((node, i) => ({ index: i, color: node.value % 2 === 0 ? 'green' as const : 'red' as const })),
    meta: [`evens = [${evens.map((e) => e.value).join(', ')}]`, `odds = [${odds.map((o) => o.value).join(', ')}]`],
    codeLine: 8,
    done: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 5. Detect Cycle — Floyd: detect, loop length, loop start, remove
// ---------------------------------------------------------------------------
function detectCycleSteps(input: string): LLStep[] {
  const [valuesRaw, posRaw = '-1'] = input.split(';');
  const values = parseNumbers(valuesRaw);
  const nodes = freshNodes(values);
  const n = nodes.length;
  const cyclePos = Math.trunc(Number(posRaw.trim()));
  const hasCycle = cyclePos >= 0 && cyclePos < n && n > 0;
  const cycleTo = hasCycle ? cyclePos : null;

  const steps: LLStep[] = [];
  if (n === 0) {
    return [{ description: 'List is empty — no cycle.', event: 'not-found', nodes: [], pointers: [], highlights: [], cycleTo: null, done: true }];
  }

  // next(i): follow the pointer, honoring the cycle link at the tail.
  const next = (i: number): number => {
    if (i === n - 1) return hasCycle ? (cyclePos as number) : -1;
    return i + 1;
  };

  steps.push({
    description: hasCycle
      ? `Tail (index ${n - 1}) links back to index ${cyclePos}. Run Floyd's tortoise & hare from the head.`
      : `No cycle declared (tail → null). Run Floyd's tortoise & hare to confirm.`,
    event: 'visit',
    nodes: snap(nodes),
    pointers: [
      { name: 'slow', index: 0, color: 'green' },
      { name: 'fast', index: 0, color: 'red' },
    ],
    highlights: [{ index: 0, color: 'blue' }],
    cycleTo,
    meta: ['Phase 1 — detect'],
    codeLine: 2,
  });

  // Phase 1: detect meeting point.
  let slow = 0;
  let fast = 0;
  let meet = -1;
  let guard = 0;
  const maxIter = n * 4 + 10;
  while (guard < maxIter) {
    guard += 1;
    // line 3 — loop condition
    steps.push({
      description: `Loop check: fast (index ${fast}) and its next exist — take a paired step.`,
      event: 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      cycleTo,
      codeLine: 3,
    });
    slow = next(slow);
    const f1 = next(fast);
    fast = f1 === -1 ? -1 : next(f1);
    if (slow === -1 || fast === -1) {
      steps.push({
        description: 'fast reached null → there is NO cycle in the list.',
        event: 'not-found',
        nodes: snap(nodes),
        pointers: slow >= 0 ? [{ name: 'slow', index: slow, color: 'green' }] : [],
        highlights: [],
        cycleTo,
        meta: ['cycle = false'],
        codeLine: 6,
        done: true,
      });
      return steps;
    }
    steps.push({
      description: `slow → ${slow} (${nodes[slow].value}), fast → ${fast} (${nodes[fast].value}). ${slow === fast ? 'They MET — a cycle exists!' : 'Not equal yet, keep moving.'}`,
      event: slow === fast ? 'found' : 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'slow', index: slow, color: 'green' },
        { name: 'fast', index: fast, color: 'red' },
      ],
      highlights: slow === fast ? [{ index: slow, color: 'yellow' }] : [{ index: slow, color: 'green' }, { index: fast, color: 'red' }],
      cycleTo,
      codeLine: slow === fast ? 5 : 4,
    });
    if (slow === fast) { meet = slow; break; }
  }

  if (meet === -1) {
    steps.push({ description: 'No cycle detected.', event: 'not-found', nodes: snap(nodes), pointers: [], highlights: [], cycleTo, codeLine: 6, done: true });
    return steps;
  }

  // Phase 2: loop length — walk from meeting point until back to it.
  let len = 1;
  let p = next(meet);
  while (p !== meet) { len += 1; p = next(p); }
  steps.push({
    description: `Phase 2 — measure loop length: walk from the meeting node until returning to it → length = ${len}.`,
    event: 'visit',
    nodes: snap(nodes),
    pointers: [{ name: 'meet', index: meet, color: 'yellow' }],
    highlights: collectLoopIndices(meet, next).map((index) => ({ index, color: 'purple' as const })),
    cycleTo,
    meta: [`loop length = ${len}`],
    codeLine: 8,
  });

  // Phase 3: loop start — move one pointer to head, advance both 1×.
  let a = 0;
  let b = meet;
  steps.push({
    description: 'Phase 3 — find loop start: reset one pointer to head; advance both one step at a time. They meet at the loop entry.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [
      { name: 'p1', index: a, color: 'green' },
      { name: 'p2', index: b, color: 'red' },
    ],
    highlights: [{ index: a, color: 'green' }, { index: b, color: 'red' }],
    cycleTo,
    codeLine: 10,
  });
  while (a !== b) {
    a = next(a);
    b = next(b);
    steps.push({
      description: `p1 → ${a} (${nodes[a].value}), p2 → ${b} (${nodes[b].value}). ${a === b ? 'Met at the loop start!' : 'Advance both by one.'}`,
      event: a === b ? 'found' : 'compare',
      nodes: snap(nodes),
      pointers: [
        { name: 'p1', index: a, color: 'green' },
        { name: 'p2', index: b, color: 'red' },
      ],
      highlights: a === b ? [{ index: a, color: 'yellow' }] : [{ index: a, color: 'green' }, { index: b, color: 'red' }],
      cycleTo,
      codeLine: 11,
    });
  }
  const loopStart = a;

  // Phase 4: remove the loop — set the tail's next to null.
  steps.push({
    description: `Phase 4 — remove the loop: the node before the loop start (the tail, index ${n - 1}) has its next set to null.`,
    event: 'swap',
    nodes: snap(nodes),
    pointers: [{ name: 'start', index: loopStart, color: 'yellow' }, { name: 'tail', index: n - 1, color: 'red' }],
    highlights: [{ index: loopStart, color: 'yellow' }, { index: n - 1, color: 'red' }],
    cycleTo,
    meta: [`loop start = index ${loopStart}`, `loop length = ${len}`],
    codeLine: 12,
  });
  steps.push({
    description: 'Loop removed — the list is now a clean acyclic chain ending in null. ✓',
    event: 'complete',
    nodes: snap(nodes),
    pointers: [],
    highlights: nodes.map((_, i) => ({ index: i, color: 'green' as const })),
    cycleTo: null,
    meta: ['cycle = false', `removed link tail → ${cyclePos}`],
    codeLine: 13,
    done: true,
  });

  return steps;
}

function collectLoopIndices(meet: number, next: (i: number) => number): number[] {
  const out = [meet];
  let p = next(meet);
  while (p !== meet) { out.push(p); p = next(p); }
  return out;
}

// ---------------------------------------------------------------------------
// 6. Sort a Linked List — merge sort (visualized by reordering snapshots)
// ---------------------------------------------------------------------------
function sortListSteps(values: number[]): LLStep[] {
  const nodes = freshNodes(values);
  const steps: LLStep[] = [];
  const n = nodes.length;

  if (n <= 1) {
    return [{
      description: n === 0 ? 'Empty list — already sorted.' : 'Single node — already sorted.',
      event: 'complete', nodes: snap(nodes), pointers: [], highlights: nodes.map((_, i) => ({ index: i, color: 'green' as const })), codeLine: 2, done: true,
    }];
  }

  steps.push({
    description: 'Merge sort: recursively split the list into halves until single nodes remain, then merge sorted runs.',
    event: 'visit',
    nodes: snap(nodes),
    pointers: [],
    highlights: nodes.map((_, i) => ({ index: i, color: 'blue' as const })),
    meta: ['Time O(n log n)'],
    codeLine: 0,
  });

  // `order` is the current global visual ordering of node ids; we mutate the
  // slice in place when merging so each step can show the partially-sorted list.
  const order = nodes.slice();

  // offset = where this segment starts in the global `order` array.
  const mergeSort = (lo: number, hi: number) => {
    if (hi - lo <= 1) {
      // lines 1–2 — base case
      steps.push({
        description: `Base case: indices ${lo}…${hi - 1} is a single node (${order[lo].value}) — already sorted, return it.`,
        event: 'visit',
        nodes: snap(order),
        pointers: [],
        highlights: lo < hi ? [{ index: lo, color: 'green' as const }] : [],
        codeLine: 2,
      });
      return;
    }
    const mid = (lo + hi) >> 1;
    // line 3 — split
    steps.push({
      description: `Split indices ${lo}…${hi - 1} into [${lo}…${mid - 1}] and [${mid}…${hi - 1}].`,
      event: 'recurse',
      nodes: snap(order),
      pointers: [{ name: 'mid', index: mid, color: 'yellow' }],
      highlights: [
        ...range(lo, mid).map((i) => ({ index: i, color: 'green' as const })),
        ...range(mid, hi).map((i) => ({ index: i, color: 'red' as const })),
      ],
      codeLine: 3,
    });
    // line 4 — sort the left half
    steps.push({
      description: `Recurse on the left half: sortList(indices ${lo}…${mid - 1}).`,
      event: 'recurse',
      nodes: snap(order),
      pointers: [],
      highlights: range(lo, mid).map((i) => ({ index: i, color: 'green' as const })),
      codeLine: 4,
    });
    mergeSort(lo, mid);
    // line 5 — sort the right half
    steps.push({
      description: `Recurse on the right half: sortList(indices ${mid}…${hi - 1}).`,
      event: 'recurse',
      nodes: snap(order),
      pointers: [],
      highlights: range(mid, hi).map((i) => ({ index: i, color: 'red' as const })),
      codeLine: 5,
    });
    mergeSort(mid, hi);

    // Merge order[lo..mid) and order[mid..hi)
    const left = order.slice(lo, mid);
    const right = order.slice(mid, hi);
    const merged: LLVisNode[] = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      if (left[i].value <= right[j].value) { merged.push(left[i]); i += 1; }
      else { merged.push(right[j]); j += 1; }
    }
    while (i < left.length) { merged.push(left[i]); i += 1; }
    while (j < right.length) { merged.push(right[j]); j += 1; }
    for (let k = 0; k < merged.length; k += 1) order[lo + k] = merged[k];

    // line 6 — merge sorted runs
    steps.push({
      description: `Merge → [${merged.map((m) => m.value).join(', ')}] sorted into indices ${lo}…${hi - 1}.`,
      event: 'swap',
      nodes: snap(order),
      pointers: [],
      highlights: range(lo, hi).map((idx) => ({ index: idx, color: 'purple' as const })),
      codeLine: 6,
    });
  };

  mergeSort(0, n);

  steps.push({
    description: `Done — list sorted: [${order.map((o) => o.value).join(', ')}]. ✓`,
    event: 'complete',
    nodes: snap(order),
    pointers: [],
    highlights: order.map((_, i) => ({ index: i, color: 'green' as const })),
    codeLine: 6,
    done: true,
  });

  return steps;
}

function range(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let i = lo; i < hi; i += 1) out.push(i);
  return out;
}
