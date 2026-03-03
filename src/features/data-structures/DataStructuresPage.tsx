import { Link, useLocation } from 'react-router-dom';
import { GitBranch, ArrowRight, Database, Layers, AlignJustify, List, Link2 } from 'lucide-react';

const structures = [
  {
    path: '/data-structures/balanced-trees',
    title: 'Balanced Trees',
    subtitle: 'Self-balancing binary search trees',
    description: 'Insert and delete values in Binary Search Trees, AVL Trees, and Red-Black Trees. Watch rotations, recoloring, and rebalancing in real time.',
    skills: ['BST', 'AVL', 'Red-Black', 'Rotations'],
    gradient: 'from-rose-500 to-red-500',
    shadowColor: 'shadow-rose-500/20',
    icon: GitBranch,
  },
  {
    path: '/data-structures/stack',
    title: 'Stack',
    subtitle: 'Last In, First Out (LIFO)',
    description: 'Push and pop elements onto a stack. Visualize LIFO order, peek at the top, and step through each operation with animated highlights.',
    skills: ['LIFO', 'Push O(1)', 'Pop O(1)', 'Peek O(1)'],
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    icon: Layers,
  },
  {
    path: '/data-structures/queue',
    title: 'Queue',
    subtitle: 'First In, First Out (FIFO)',
    description: 'Enqueue elements at the rear and dequeue from the front. Watch front and rear pointers update with each operation.',
    skills: ['FIFO', 'Enqueue O(1)', 'Dequeue O(1)', 'Peek O(1)'],
    gradient: 'from-sky-500 to-blue-500',
    shadowColor: 'shadow-sky-500/20',
    icon: AlignJustify,
  },
  {
    path: '/data-structures/array',
    title: 'Array',
    subtitle: 'Contiguous indexed memory',
    description: 'Access elements by index in O(1). Visualize insert and delete with element shifting, and watch a linear search scan the array step-by-step.',
    skills: ['Access O(1)', 'Insert O(n)', 'Delete O(n)', 'Search O(n)'],
    gradient: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/20',
    icon: List,
  },
  {
    path: '/data-structures/linked-list',
    title: 'Linked List',
    subtitle: 'Pointer-chained nodes',
    description: 'Prepend, append, insert, delete, and search through a singly linked list. Watch traversal step through each node and pointer re-linking in action.',
    skills: ['Prepend O(1)', 'Append O(n)', 'Insert O(n)', 'Delete O(n)'],
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    icon: Link2,
  },
];

export default function DataStructuresPage() {
  const location = useLocation();

  if (location.pathname === '/data-structures') {
    return (
      <div className="flex-1 overflow-y-auto">
        <section className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 ring-1 ring-rose-500/20">
            <Database size={14} className="text-rose-400" />
            <span className="text-xs font-medium text-rose-300">Data Structures</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Explore <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Data Structures</span>
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm text-slate-400 leading-relaxed">
            Visualize how data structures organize, store, and retrieve information — from balanced trees to advanced indexing.
          </p>
        </section>

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {structures.map(({ path, title, subtitle, description, skills, gradient, shadowColor, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  group relative flex flex-col rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 backdrop-blur-sm
                  transition-all duration-300 hover:border-slate-600/60 hover:bg-slate-900/70 hover:scale-[1.01]
                  shadow-lg ${shadowColor}
                `}
              >
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-base font-bold text-white">{title}</h4>
                <p className="text-[10px] text-slate-500 italic">{subtitle}</p>
                <p className="mt-2 flex-1 text-xs text-slate-400 leading-relaxed">{description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return null;
}
