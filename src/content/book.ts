import type { LucideIcon } from 'lucide-react';
import {
  AlignJustify,
  Binary,
  Boxes,
  Braces,
  Database,
  Dna,
  Flag,
  Gamepad2,
  GitBranch,
  GitFork,
  Grid3X3,
  Layers,
  Link2,
  List,
  ListFilter,
  Network,
  Plane,
  Puzzle,
  Search,
  Sigma,
  Split,
  Swords,
  TreePine,
  Type,
  Waypoints,
} from 'lucide-react';

export interface BookTopic {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
}

export interface BookChapter {
  id: 'foundations' | 'algorithms' | 'practice' | 'git' | 'code-lab';
  number: string;
  title: string;
  shortTitle: string;
  path: string;
  description: string;
  outcome: string;
  icon: LucideIcon;
  accent: {
    text: string;
    soft: string;
    border: string;
    gradient: string;
  };
  topics: BookTopic[];
}

export const BOOK_CHAPTERS: BookChapter[] = [
  {
    id: 'foundations',
    number: '01',
    title: 'Data Foundations',
    shortTitle: 'Foundations',
    path: '/data-structures',
    description: 'Start with the shapes that hold data, then watch their operations change memory and links step by step.',
    outcome: 'Choose the right structure by access pattern and complexity.',
    icon: Database,
    accent: {
      text: 'text-rose-300',
      soft: 'bg-rose-400/10',
      border: 'border-rose-400/25',
      gradient: 'from-rose-400 to-orange-300',
    },
    topics: [
      {
        path: '/data-structures/array',
        title: 'Arrays',
        subtitle: 'Contiguous indexed memory',
        description: 'Access by index, shift on insert and delete, and follow a linear search.',
        tags: ['Access O(1)', 'Insert O(n)', 'Search O(n)'],
        icon: List,
      },
      {
        path: '/data-structures/linked-list',
        title: 'Linked Lists',
        subtitle: 'Pointer-chained nodes',
        description: 'Trace prepend, append, insert, delete, and search as pointers reconnect.',
        tags: ['Pointers', 'Traversal', 'Mutation'],
        icon: Link2,
      },
      {
        path: '/data-structures/stack',
        title: 'Stacks',
        subtitle: 'Last in, first out',
        description: 'Push, pop, and peek while the top of the stack moves through each operation.',
        tags: ['LIFO', 'Push O(1)', 'Pop O(1)'],
        icon: Layers,
      },
      {
        path: '/data-structures/queue',
        title: 'Queues',
        subtitle: 'First in, first out',
        description: 'Enqueue at the rear and dequeue from the front while both pointers update.',
        tags: ['FIFO', 'Enqueue O(1)', 'Dequeue O(1)'],
        icon: AlignJustify,
      },
      {
        path: '/data-structures/balanced-trees',
        title: 'Balanced Trees',
        subtitle: 'Self-balancing search trees',
        description: 'Compare BST, AVL, and Red-Black insertion, deletion, rotation, and recoloring.',
        tags: ['BST', 'AVL', 'Red-Black', 'Rotations'],
        icon: TreePine,
      },
      {
        path: '/data-structures/trie',
        title: 'Tries',
        subtitle: 'Prefix trees for strings',
        description: 'Watch words share prefixes during insert, delete, exact search, and prefix search.',
        tags: ['Prefix', 'Insert', 'Search'],
        icon: Type,
      },
      {
        path: '/data-structures/segment-tree',
        title: 'Segment Trees',
        subtitle: 'Range query trees',
        description: 'Build interval aggregates, run range sums, and apply point updates.',
        tags: ['Range Query', 'Point Update', 'O(log n)'],
        icon: Split,
      },
      {
        path: '/data-structures/fenwick-tree',
        title: 'Fenwick Trees',
        subtitle: 'Compact prefix sums',
        description: 'Follow lowbit jumps through prefix queries, range sums, and updates.',
        tags: ['Lowbit', 'Prefix Sum', 'O(log n)'],
        icon: Sigma,
      },
    ],
  },
  {
    id: 'algorithms',
    number: '02',
    title: 'Core Algorithms',
    shortTitle: 'Algorithms',
    path: '/algorithms',
    description: 'Move from comparison and search to traversal, recursion, partitioning, and composed data structures.',
    outcome: 'Read an algorithm as a sequence of decisions, state changes, and trade-offs.',
    icon: Waypoints,
    accent: {
      text: 'text-indigo-300',
      soft: 'bg-indigo-400/10',
      border: 'border-indigo-400/25',
      gradient: 'from-indigo-300 to-violet-300',
    },
    topics: [
      {
        path: '/algorithms/sorting',
        title: 'Sorting',
        subtitle: 'Comparison and divide-and-conquer',
        description: 'Compare bubble, selection, insertion, quick, heap, and merge sort.',
        tags: ['Bubble', 'Quick', 'Heap', 'Merge'],
        icon: ListFilter,
      },
      {
        path: '/algorithms/binary-search',
        title: 'Binary Search',
        subtitle: 'Halve a sorted search space',
        description: 'Compare the midpoint and discard half of the remaining range each step.',
        tags: ['Sorted Input', 'O(log n)', 'Midpoint'],
        icon: Binary,
      },
      {
        path: '/algorithms/ternary-search',
        title: 'Ternary Search',
        subtitle: 'Split a range into thirds',
        description: 'Use two midpoints to reduce a sorted search window to one third.',
        tags: ['Two Midpoints', 'Sorted Input'],
        icon: Search,
      },
      {
        path: '/algorithms/tree',
        title: 'Tree Traversal',
        subtitle: 'Visit hierarchical data',
        description: 'Compare preorder, inorder, postorder, and level-order traversal.',
        tags: ['DFS', 'BFS', 'Recursion'],
        icon: TreePine,
      },
      {
        path: '/algorithms/graph',
        title: 'Graph Traversal',
        subtitle: 'Explore paths and frontiers',
        description: 'Run BFS, DFS, Dijkstra, and A* across an editable grid.',
        tags: ['BFS', 'DFS', 'Dijkstra', 'A*'],
        icon: Network,
      },
      {
        path: '/algorithms/linked-list',
        title: 'Linked List Problems',
        subtitle: 'Pointers, cycles, caches, and sorting',
        description: 'Practice middle, reverse, palindrome, LRU, cycle detection, and merge sort.',
        tags: ['Two Pointers', 'Floyd', 'LRU'],
        icon: Link2,
      },
      {
        path: '/algorithms/queue-using-stacks',
        title: 'Queue Using Stacks',
        subtitle: 'FIFO from LIFO containers',
        description: 'Transfer values between two stacks while preserving queue order.',
        tags: ['Stack In', 'Stack Out', 'Amortized O(1)'],
        icon: Layers,
      },
      {
        path: '/algorithms/stack-using-queues',
        title: 'Stack Using Queues',
        subtitle: 'LIFO from FIFO containers',
        description: 'Rotate two queues so the newest element always leaves first.',
        tags: ['Queue', 'Rotation', 'LIFO'],
        icon: Boxes,
      },
      {
        path: '/algorithms/tower-of-hanoi',
        title: 'Tower of Hanoi',
        subtitle: 'Recursive disk transfer',
        description: 'Break one disk movement problem into two smaller recursive problems.',
        tags: ['Recursion', '2ⁿ − 1', 'Call Stack'],
        icon: GitFork,
      },
      {
        path: '/algorithms/rat-maze',
        title: 'Rat in a Maze',
        subtitle: 'Search with backtracking',
        description: 'Compare recursive DFS and BFS across free and blocked cells.',
        tags: ['DFS', 'BFS', 'Backtracking'],
        icon: Waypoints,
      },
      {
        path: '/algorithms/grid-search',
        title: 'Grid Search',
        subtitle: 'Navigate allowed positions',
        description: 'Search from source to target while respecting occupied cells.',
        tags: ['Grid', 'Source', 'Target'],
        icon: Grid3X3,
      },
      {
        path: '/algorithms/dutch-national-flag',
        title: 'Sort Colors',
        subtitle: 'Dutch national flag partition',
        description: 'Partition three values with low, mid, and high pointers in one pass.',
        tags: ['Three Pointers', 'O(n)', 'In Place'],
        icon: Flag,
      },
      {
        path: '/algorithms/top-k-frequent',
        title: 'Top K Frequent',
        subtitle: 'Frequency ranking',
        description: 'Count values, rank their frequencies, and extract the most common.',
        tags: ['Hash Map', 'Heap', 'Bucket'],
        icon: ListFilter,
      },
    ],
  },
  {
    id: 'practice',
    number: '03',
    title: 'Practice & Play',
    shortTitle: 'Practice',
    path: '/games',
    description: 'Turn abstract ideas into intuition with puzzles, simulations, races, and guided challenges.',
    outcome: 'Recognize algorithmic patterns under pressure and compare real behavior.',
    icon: Gamepad2,
    accent: {
      text: 'text-cyan-300',
      soft: 'bg-cyan-400/10',
      border: 'border-cyan-400/25',
      gradient: 'from-cyan-300 to-emerald-300',
    },
    topics: [
      {
        path: '/games/fibonacci',
        title: 'Fibonacci Spiral',
        subtitle: 'Sequences become geometry',
        description: 'Place Fibonacci squares and watch the golden ratio converge.',
        tags: ['Sequences', 'Golden Ratio', 'Geometry'],
        icon: Puzzle,
      },
      {
        path: '/games/dijkstra',
        title: 'Dijkstra Delivery',
        subtitle: 'Plan the shortest delivery route',
        description: 'Build a route and compare it to Dijkstra’s optimal path.',
        tags: ['Shortest Path', 'Greedy', 'Priority Queue'],
        icon: Waypoints,
      },
      {
        path: '/games/world-map',
        title: 'World Map Flights',
        subtitle: 'Global route planning',
        description: 'Compare Dijkstra, A*, BFS, and greedy search across airport routes.',
        tags: ['Dijkstra', 'A*', 'Route Planning'],
        icon: Plane,
      },
      {
        path: '/games/battles',
        title: 'Algorithm Battles',
        subtitle: 'Head-to-head performance',
        description: 'Race sorting, pathfinding, and recursion strategies on the same input.',
        tags: ['Big-O', 'Metrics', 'Comparison'],
        icon: Swords,
      },
      {
        path: '/games/sudoku-solver',
        title: 'Sudoku Solver',
        subtitle: 'Constraint satisfaction',
        description: 'Step through backtracking on generated 4×4, 9×9, and 16×16 boards.',
        tags: ['Backtracking', 'Constraints', 'Search'],
        icon: Grid3X3,
      },
      {
        path: '/games/mahjong',
        title: 'Mahjong Solver',
        subtitle: 'Combinatorial validation',
        description: 'Trace a backtracking solver as it tests melds and pairs.',
        tags: ['Backtracking', 'Combinatorics'],
        icon: Layers,
      },
      {
        path: '/games/evolution-simulator',
        title: 'Evolution Simulator',
        subtitle: 'Genetic algorithm playground',
        description: 'Tune selection, crossover, and mutation while a population converges.',
        tags: ['Selection', 'Crossover', 'Mutation'],
        icon: Dna,
      },
      {
        path: '/games/rubiks-cube',
        title: 'Rubik’s Cube',
        subtitle: 'Moves, inverses, and state',
        description: 'Practice notation, free play, and guided scramble reversal.',
        tags: ['3D State', 'Inverse Moves', 'Notation'],
        icon: Puzzle,
      },
    ],
  },
  {
    id: 'git',
    number: '04',
    title: 'Git Field Guide',
    shortTitle: 'Git',
    path: '/git',
    description: 'Treat version control as a graph you can inspect instead of a list of commands to memorize.',
    outcome: 'Predict how commits, branches, merges, rebases, and remotes change repository state.',
    icon: GitBranch,
    accent: {
      text: 'text-amber-300',
      soft: 'bg-amber-400/10',
      border: 'border-amber-400/25',
      gradient: 'from-amber-300 to-orange-300',
    },
    topics: [],
  },
  {
    id: 'code-lab',
    number: 'LAB',
    title: 'Visualize Your Code',
    shortTitle: 'Code Lab',
    path: '/visualize-code',
    description: 'Paste a small JavaScript algorithm and inspect its execution as a bounded sequence of lines and variable snapshots.',
    outcome: 'Connect each line of code to the state change it produces.',
    icon: Braces,
    accent: {
      text: 'text-emerald-300',
      soft: 'bg-emerald-400/10',
      border: 'border-emerald-400/25',
      gradient: 'from-emerald-300 to-teal-300',
    },
    topics: [],
  },
];

export function getBookChapter(id: BookChapter['id']): BookChapter {
  const chapter = BOOK_CHAPTERS.find((item) => item.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}
