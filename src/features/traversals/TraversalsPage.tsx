import { Link, useLocation } from 'react-router-dom';
import { Network, TreePine, ArrowRight, Waypoints } from 'lucide-react';

const traversals = [
  {
    path: '/traversals/graph',
    title: 'Graph Traversal',
    subtitle: 'Pathfinding on interactive grids',
    description: 'Visualize BFS, DFS, Dijkstra, and A* pathfinding algorithms on an interactive grid. Draw walls, place start/end points, and watch the algorithm explore in real time with audio feedback.',
    skills: ['BFS', 'DFS', 'Dijkstra', 'A*'],
    gradient: 'from-indigo-500 to-blue-500',
    shadowColor: 'shadow-indigo-500/20',
    icon: Network,
  },
  {
    path: '/traversals/tree',
    title: 'Tree Traversal',
    subtitle: 'Step through binary tree walks',
    description: 'Visualize In-Order, Pre-Order, Post-Order, and Level-Order traversals on a randomized binary tree with step-by-step playback and audio effects.',
    skills: ['In-Order', 'Pre-Order', 'Post-Order', 'Level-Order'],
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    icon: TreePine,
  },
];

export default function TraversalsPage() {
  const location = useLocation();

  if (location.pathname === '/traversals') {
    return (
      <div className="flex-1 overflow-y-auto">
        <section className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 ring-1 ring-indigo-500/20">
            <Waypoints size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">Traversal Algorithms</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Explore <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Traversals</span>
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm text-slate-400 leading-relaxed">
            Visualize how algorithms navigate graphs and trees — from grid-based pathfinding to binary tree walks.
          </p>
        </section>

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-2xl grid gap-5">
            {traversals.map(({ path, title, subtitle, description, skills, gradient, shadowColor, icon: Icon }) => (
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

  return null;
}
