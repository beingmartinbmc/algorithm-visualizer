import { Link } from 'react-router-dom';
import { Network, BarChart3, Grid3X3, TreePine, GitBranch, ArrowRight, Sparkles, Code2, Eye } from 'lucide-react';

const modules = [
  {
    path: '/graph-traversal',
    title: 'Graph Traversal',
    description: 'Visualize BFS, DFS, Dijkstra, and A* pathfinding algorithms on an interactive grid. Draw walls, place start/end points, and watch the algorithm explore.',
    icon: Network,
    gradient: 'from-indigo-500 to-blue-500',
    shadowColor: 'shadow-indigo-500/20',
    tags: ['BFS', 'DFS', 'Dijkstra', 'A*'],
  },
  {
    path: '/sorting',
    title: 'Sorting Algorithms',
    description: 'Watch sorting algorithms in action with animated bar charts and sound. Compare Bubble, Selection, Insertion, Quick, Heap, and Merge Sort side by side.',
    icon: BarChart3,
    gradient: 'from-violet-500 to-fuchsia-500',
    shadowColor: 'shadow-violet-500/20',
    tags: ['Bubble', 'Selection', 'Insertion', 'Quick', 'Heap', 'Merge'],
  },
  {
    path: '/sudoku-solver',
    title: 'Sudoku Solver',
    description: 'Generate random Sudoku puzzles of different sizes and step through a backtracking solver. Go forward, backward, or solve instantly.',
    icon: Grid3X3,
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    tags: ['4×4', '9×9', '16×16', 'Backtracking'],
  },
  {
    path: '/tree-traversal',
    title: 'Tree Traversals',
    description: 'Visualize In-Order, Pre-Order, Post-Order, and Level-Order traversals on a randomized binary tree with step-by-step playback.',
    icon: TreePine,
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    tags: ['In-Order', 'Pre-Order', 'Post-Order', 'Level-Order'],
  },
  {
    path: '/balanced-trees',
    title: 'BST / AVL / RB Tree',
    description: 'Insert and delete values in Binary Search Trees, AVL Trees, and Red-Black Trees. Watch rotations, recoloring, and rebalancing in real time.',
    icon: GitBranch,
    gradient: 'from-rose-500 to-red-500',
    shadowColor: 'shadow-rose-500/20',
    tags: ['BST', 'AVL', 'Red-Black', 'Rotations'],
  },
];

const features = [
  {
    icon: Eye,
    title: 'Visual Learning',
    description: 'See algorithms come alive with step-by-step animations and color-coded states.',
  },
  {
    icon: Sparkles,
    title: 'Audio Feedback',
    description: 'Hear the algorithms work with synthesized tones that adapt to visualization speed.',
  },
  {
    icon: Code2,
    title: 'Interactive Controls',
    description: 'Adjust speed, draw obstacles, resize arrays, and step through each decision.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 ring-1 ring-indigo-500/20">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">Interactive Algorithm Visualizer</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Understand Algorithms
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              by Watching Them Work
            </span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base text-slate-400 leading-relaxed">
            Explore graph traversal, sorting, tree structures, and constraint-solving algorithms
            through beautiful, interactive visualizations with real-time audio feedback.
          </p>
        </div>
      </section>

      {/* Features row */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80">
                <Icon size={18} className="text-slate-300" />
              </div>
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Module cards */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Choose a Module
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map(({ path, title, description, icon: Icon, gradient, shadowColor, tags }) => (
              <Link
                key={path}
                to={path}
                className={`
                  group relative flex flex-col rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 backdrop-blur-sm
                  transition-all duration-300 hover:border-slate-600/60 hover:bg-slate-900/70 hover:scale-[1.02]
                  shadow-lg ${shadowColor}
                `}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-base font-bold text-white">{title}</h4>
                <p className="mt-2 flex-1 text-xs text-slate-400 leading-relaxed">{description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
