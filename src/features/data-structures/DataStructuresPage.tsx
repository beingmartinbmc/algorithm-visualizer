import { Link, useLocation } from 'react-router-dom';
import { GitBranch, ArrowRight, Database } from 'lucide-react';

const structures = [
  {
    path: '/data-structures/balanced-trees',
    title: 'BST / AVL / Red-Black Tree',
    subtitle: 'Self-balancing binary search trees',
    description: 'Insert and delete values in Binary Search Trees, AVL Trees, and Red-Black Trees. Watch rotations, recoloring, and rebalancing in real time.',
    skills: ['BST', 'AVL', 'Red-Black', 'Rotations'],
    gradient: 'from-rose-500 to-red-500',
    shadowColor: 'shadow-rose-500/20',
    icon: GitBranch,
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
