// Shared types for the Linked List algorithm visualizers.
//
// The pure step-builders in `algorithms/linkedListAlgorithms.ts` turn an input
// string into an array of `LLStep` objects. The hook drives a pointer through
// that array (forward / backward / auto-play) and the canvas renders whatever
// the current step describes. This mirrors the rest of the codebase: "what the
// algorithm does" (steps) is fully separated from "how it animates" (canvas).

export type LLProblem =
  | 'find-middle'
  | 'reverse-list'
  | 'add-two-numbers'
  | 'reverse-k-group'
  | 'palindrome'
  | 'lru-cache'
  | 'segregate'
  | 'detect-cycle'
  | 'sort-list';

// Re-uses the event vocabulary understood by `useAlgorithmSound`.
export type LLEvent =
  | 'compare'
  | 'swap'
  | 'visit'
  | 'push'
  | 'pop'
  | 'recurse'
  | 'found'
  | 'not-found'
  | 'complete';

export type LLColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple';

export interface LLVisNode {
  id: number;
  value: number;
  /** Optional label used by LRU entries (e.g. "1:100"). */
  label?: string;
}

/** A named pointer hovering above a node index (slow / fast / prev / curr…). */
export interface LLPointer {
  name: string;
  index: number;
  color?: LLColor;
}

export interface LLHighlight {
  index: number;
  color: LLColor;
}

/** Dedicated payload for the LRU cache visualizer. */
export interface LRUView {
  capacity: number;
  /** Most-recently-used first. */
  entries: { key: number; value: number }[];
  hitKey?: number | null;
  missKey?: number | null;
  evictKey?: number | null;
  op?: string;
}

export interface LLStep {
  description: string;
  event: LLEvent;
  nodes: LLVisNode[];
  pointers: LLPointer[];
  highlights: LLHighlight[];
  /** Index the tail links back to (for cycle problems); null = acyclic. */
  cycleTo?: number | null;
  meta?: string[];
  /** Present only for the LRU cache problem. */
  lru?: LRUView;
  /** 0-based index into the problem's `pseudocode` array (line being executed). */
  codeLine?: number;
  done?: boolean;
}

export interface ProblemInfo {
  title: string;
  subtitle: string;
  inputLabel: string;
  defaultInput: string;
  helper: string;
  tags: string[];
  complexity: string;
  /** Pseudocode shown in the animated code panel; steps reference lines by index. */
  pseudocode: string[];
}

export const PROBLEM_INFO: Record<LLProblem, ProblemInfo> = {
  'find-middle': {
    title: 'Find Middle of a Linked List',
    subtitle: "Tortoise & hare — slow / fast pointers",
    inputLabel: 'List values',
    defaultInput: '10,20,30,40,50,60,70',
    helper: 'Comma-separated numbers. slow moves 1 step, fast moves 2; when fast reaches the end, slow sits on the middle.',
    tags: ['Two Pointers', 'O(n)', 'O(1) space'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function findMiddle(head):',
      '  slow = head',
      '  fast = head',
      '  while fast.next and fast.next.next:',
      '    slow = slow.next        // 1 step',
      '    fast = fast.next.next   // 2 steps',
      '  return slow               // middle node',
    ],
  },
  'reverse-list': {
    title: 'Reverse a Linked List',
    subtitle: 'Iterative pointer reversal (prev / curr / next)',
    inputLabel: 'List values',
    defaultInput: '10,20,30,40,50',
    helper: 'Comma-separated numbers. Walk the list once, flipping each node\'s next pointer to point at the previous node.',
    tags: ['Two Pointers', 'In-place', 'O(n)'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function reverse(head):',
      '  prev = null',
      '  curr = head',
      '  while curr:',
      '    next = curr.next   // remember rest',
      '    curr.next = prev   // flip the link',
      '    prev = curr        // advance prev',
      '    curr = next        // advance curr',
      '  return prev          // new head',
    ],
  },
  'add-two-numbers': {
    title: 'Add Two Numbers',
    subtitle: 'Digit-by-digit addition with carry (digits reversed)',
    inputLabel: 'numberA; numberB',
    defaultInput: '342; 465',
    helper: 'Format: "numberA; numberB". Each number is stored as a list with its least-significant digit first; add node by node, carrying over.',
    tags: ['Math', 'Carry', 'O(n)'],
    complexity: 'Time O(max(m,n)) · Space O(max(m,n))',
    pseudocode: [
      'function addTwoNumbers(a, b):',
      '  dummy = node(0); tail = dummy',
      '  carry = 0',
      '  while a or b or carry:',
      '    sum = carry',
      '    if a: sum += a.val; a = a.next',
      '    if b: sum += b.val; b = b.next',
      '    carry = sum / 10',
      '    tail.next = node(sum % 10)',
      '    tail = tail.next',
      '  return dummy.next',
    ],
  },
  'reverse-k-group': {
    title: 'Reverse Nodes in k-Group',
    subtitle: 'Reverse every k nodes iteratively (handles a final partial group)',
    inputLabel: 'values; k',
    defaultInput: '1,2,3,4,5,6,7; 3',
    helper: 'Format: "values; k". Reverse each consecutive block of k nodes. A trailing group of fewer than k nodes is left as-is.',
    tags: ['Two Pointers', 'In-place', 'O(n)'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function reverseKGroup(head, k):',
      '  dummy = node(0); dummy.next = head',
      '  groupPrev = dummy',
      '  while true:',
      '    kth = node k ahead of groupPrev',
      '    if kth is null: break    // fewer than k left',
      '    groupNext = kth.next',
      '    // reverse the group in place',
      '    prev = groupNext; curr = groupPrev.next',
      '    while curr != groupNext:',
      '      next = curr.next; curr.next = prev',
      '      prev = curr; curr = next',
      '    tmp = groupPrev.next',
      '    groupPrev.next = kth; groupPrev = tmp',
      '  return dummy.next',
    ],
  },
  palindrome: {
    title: 'Palindrome Linked List',
    subtitle: 'Find middle (tortoise & hare), reverse, compare',
    inputLabel: 'List values',
    defaultInput: '1,2,3,2,1',
    helper: 'Comma-separated numbers. Find the middle with slow/fast, reverse the 2nd half, then compare both halves inward.',
    tags: ['Two Pointers', 'Reverse', 'O(n)'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function isPalindrome(head):',
      '  // 1. find middle with slow / fast',
      '  slow = fast = head',
      '  while fast.next and fast.next.next:',
      '    slow = slow.next; fast = fast.next.next',
      '  // 2. reverse the second half',
      '  second = reverse(slow.next)',
      '  // 3. compare halves moving forward',
      '  p = head; q = second',
      '  while q:',
      '    if p.val != q.val: return false',
      '    p = p.next; q = q.next',
      '  return true',
    ],
  },
  'lru-cache': {
    title: 'LRU Cache',
    subtitle: 'get / put with a fixed capacity',
    inputLabel: 'capacity; operations',
    defaultInput: '2; put 1 100, put 2 200, get 1, put 3 300, get 2, put 4 400, get 1, get 3, get 4',
    helper: 'Format: "capacity; op, op, …". Ops: "put <key> <value>" or "get <key>". Most-recently-used moves to the front; the least-recently-used is evicted when full.',
    tags: ['Hash Map', 'Doubly List', 'O(1)'],
    complexity: 'get / put O(1)',
    pseudocode: [
      'class LRUCache(capacity):',
      '  map = {}            // key -> node',
      '  list = doublyLinked // front = most recent',
      '',
      '  get(key):',
      '    if key not in map: return -1   // MISS',
      '    moveToFront(key)               // HIT',
      '    return map[key].value',
      '',
      '  put(key, value):',
      '    if key in map:',
      '      map[key].value = value; moveToFront(key)',
      '    else:',
      '      if size == capacity: evictLast()',
      '      insertFront(key, value)',
    ],
  },
  segregate: {
    title: 'Segregate Even and Odd Nodes',
    subtitle: 'Even-valued nodes before odd-valued nodes',
    inputLabel: 'List values',
    defaultInput: '17,15,8,12,10,5,4,1,7,6',
    helper: 'Comma-separated numbers. Collect even-valued nodes and odd-valued nodes in order, then join the two chains.',
    tags: ['Partition', 'Stable', 'O(n)'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function segregate(head):',
      '  evens = emptyList()',
      '  odds  = emptyList()',
      '  curr = head',
      '  while curr:',
      '    if curr.val % 2 == 0: evens.append(curr)',
      '    else:                 odds.append(curr)',
      '    curr = curr.next',
      '  return join(evens, odds)   // evens then odds',
    ],
  },
  'detect-cycle': {
    title: 'Detect Cycle (Floyd)',
    subtitle: 'Detect · loop length · loop start · remove',
    inputLabel: 'values; cyclePos',
    defaultInput: '1,2,3,4,5,6,7; 2',
    helper: 'Format: "values; cyclePos". cyclePos is the index the tail links back to (-1 for no cycle). Floyd: slow/fast meet inside the loop.',
    tags: ['Floyd', 'Two Pointers', 'O(n)'],
    complexity: 'Time O(n) · Space O(1)',
    pseudocode: [
      'function detectAndRemove(head):',
      '  // 1. detect meeting point',
      '  slow = fast = head',
      '  while fast and fast.next:',
      '    slow = slow.next; fast = fast.next.next',
      '    if slow == fast: break        // cycle!',
      '  if no meeting: return "no cycle"',
      '  // 2. loop length: walk back to meet node',
      '  len = walkLoop(slow)',
      '  // 3. loop start: reset one ptr to head',
      '  p = head; q = meet',
      '  while p != q: p = p.next; q = q.next',
      '  // 4. remove: tail.next = null',
      '  unlinkTail(); return "removed"',
    ],
  },
  'sort-list': {
    title: 'Sort a Linked List',
    subtitle: 'Merge sort on a linked list',
    inputLabel: 'List values',
    defaultInput: '40,10,70,30,90,20,60,50',
    helper: 'Comma-separated numbers. Split the list into halves, sort each, and merge the sorted runs back together.',
    tags: ['Merge Sort', 'Divide & Conquer', 'O(n log n)'],
    complexity: 'Time O(n log n) · Space O(log n)',
    pseudocode: [
      'function sortList(head):',
      '  if head is null or head.next is null:',
      '    return head            // base case',
      '  mid  = splitInHalf(head) // slow/fast split',
      '  left  = sortList(head)',
      '  right = sortList(mid)',
      '  return merge(left, right) // merge sorted runs',
    ],
  },
};
