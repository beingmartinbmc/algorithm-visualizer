import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Binary, Boxes, Flag, GitFork, Grid3X3, Layers, Link2, ListFilter, Network, Search, TreePine, Waypoints } from 'lucide-react';

const algorithmCards = [
  {
    path: '/algorithms/sorting',
    title: 'Sorting Algorithms',
    subtitle: 'Comparison sorting visualizers',
    description: 'Bubble, Selection, Insertion, Quick, Heap, and Merge Sort with step playback and audio feedback.',
    tags: ['Bubble', 'Quick', 'Heap', 'Merge'],
    gradient: 'from-violet-500 to-fuchsia-500',
    shadowColor: 'shadow-violet-500/20',
    icon: ListFilter,
  },
  {
    path: '/algorithms/tree',
    title: 'Tree Algorithms',
    subtitle: 'Binary tree traversal',
    description: 'Move preorder, inorder, postorder, and level-order traversal into the tree algorithms collection.',
    tags: ['Preorder', 'Inorder', 'Postorder', 'Level Order'],
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    icon: TreePine,
  },
  {
    path: '/algorithms/graph',
    title: 'Graph Algorithms',
    subtitle: 'Grid graph traversal',
    description: 'Run BFS and DFS over a grid, with Dijkstra and A* retained for weighted/pathfinding comparison.',
    tags: ['BFS', 'DFS', 'Dijkstra', 'A*'],
    gradient: 'from-indigo-500 to-blue-500',
    shadowColor: 'shadow-indigo-500/20',
    icon: Network,
  },
  {
    path: '/algorithms/binary-search',
    title: 'Binary Search',
    subtitle: 'Halve a sorted search space',
    description: 'Search a sorted array by comparing the middle element and discarding half the range each step.',
    tags: ['Sorted Array', 'O(log n)', 'Midpoint'],
    gradient: 'from-cyan-500 to-sky-500',
    shadowColor: 'shadow-cyan-500/20',
    icon: Binary,
  },
  {
    path: '/algorithms/ternary-search',
    title: 'Ternary Search',
    subtitle: 'Split into thirds',
    description: 'Compare two midpoints and shrink a sorted search window to one third of the remaining range.',
    tags: ['Sorted Array', 'Two Mids', 'O(log n)'],
    gradient: 'from-blue-500 to-indigo-500',
    shadowColor: 'shadow-blue-500/20',
    icon: Search,
  },
  {
    path: '/algorithms/queue-using-stacks',
    title: 'Queue Using Two Stacks',
    subtitle: 'FIFO from LIFO containers',
    description: 'Enqueue into one stack and dequeue through a second stack while preserving queue order.',
    tags: ['Stack In', 'Stack Out', 'Amortized O(1)'],
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    icon: Layers,
  },
  {
    path: '/algorithms/stack-using-queues',
    title: 'Stack Using Two Queues',
    subtitle: 'LIFO from FIFO containers',
    description: 'Push into a queue, rotate through an auxiliary queue, and pop the newest element first.',
    tags: ['Queue 1', 'Queue 2', 'LIFO'],
    gradient: 'from-lime-500 to-emerald-500',
    shadowColor: 'shadow-lime-500/20',
    icon: Boxes,
  },
  {
    path: '/algorithms/tower-of-hanoi',
    title: 'Tower of Hanoi',
    subtitle: 'Recursive disk transfer',
    description: 'Move disks between pegs using recursive subproblems and a visible call sequence.',
    tags: ['Recursion', '2^n - 1', 'Pegs'],
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'shadow-rose-500/20',
    icon: GitFork,
  },
  {
    path: '/algorithms/rat-maze',
    title: 'Rat in a Maze',
    subtitle: 'Recursion and BFS',
    description: 'Compare recursive backtracking with BFS on a maze of free and blocked cells.',
    tags: ['DFS', 'BFS', 'Backtracking'],
    gradient: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-500/20',
    icon: Waypoints,
  },
  {
    path: '/algorithms/grid-search',
    title: 'Grid Search',
    subtitle: 'Free, occupied, allowed cells',
    description: 'Search from a source to a target while respecting blocked and allowed grid positions.',
    tags: ['Grid', 'Source', 'Target', 'Allowed'],
    gradient: 'from-slate-500 to-zinc-500',
    shadowColor: 'shadow-slate-500/20',
    icon: Grid3X3,
  },
  {
    path: '/algorithms/dutch-national-flag',
    title: 'Sort Colors',
    subtitle: 'Dutch national flag',
    description: 'Partition 0s, 1s, and 2s using low, mid, and high pointers in a single pass.',
    tags: ['0 / 1 / 2', 'Three Pointers', 'O(n)'],
    gradient: 'from-red-500 to-blue-500',
    shadowColor: 'shadow-red-500/20',
    icon: Flag,
  },
  {
    path: '/algorithms/top-k-frequent',
    title: 'Top K Frequent Elements',
    subtitle: 'Frequency ranking',
    description: 'Count values, rank by frequency, and extract the most common elements.',
    tags: ['Hash Map', 'Heap', 'Bucket'],
    gradient: 'from-purple-500 to-indigo-500',
    shadowColor: 'shadow-purple-500/20',
    icon: ListFilter,
  },
  {
    path: '/algorithms/linked-list',
    title: 'Linked List Algorithms',
    subtitle: 'Two pointers, Floyd, merge sort, LRU',
    description: 'Find middle, palindrome check, LRU cache, even/odd segregation, cycle detection, and merge sort — six visualizers in one collection.',
    tags: ['Two Pointers', 'Floyd', 'Merge Sort', 'LRU'],
    gradient: 'from-sky-500 to-cyan-500',
    shadowColor: 'shadow-sky-500/20',
    icon: Link2,
  },
];

export default function AlgorithmsPage() {
  const location = useLocation();
  if (location.pathname !== '/algorithms') return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 ring-1 ring-indigo-500/20">
          <Waypoints size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300">Algorithm Section</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Explore <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Algorithms</span>
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-400 leading-relaxed">
          Sorting, searching, tree, graph, recursion, stack/queue, and frequency algorithms with interactive steps and audio effects.
        </p>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {algorithmCards.map(({ path, title, subtitle, description, tags, gradient, shadowColor, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`group relative flex flex-col rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-slate-600/60 hover:bg-slate-900/70 ${shadowColor}`}
            >
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
                <Icon size={20} className="text-white" />
              </div>
              <h4 className="text-base font-bold text-white">{title}</h4>
              <p className="text-[10px] text-slate-500 italic">{subtitle}</p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">{description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Explore <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
