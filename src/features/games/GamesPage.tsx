import { Link, useLocation } from 'react-router-dom';
import { Puzzle, ArrowRight, Swords, Grid3X3 } from 'lucide-react';

const games = [
  {
    path: '/games/fibonacci',
    title: 'Fibonacci Spiral Builder',
    subtitle: 'Inspired by Leonardo Fibonacci',
    description: 'Build a golden spiral by placing Fibonacci squares in order. Watch the golden ratio converge as your spiral grows.',
    skills: ['Pattern Recognition', 'Mathematical Sequences', 'Spatial Reasoning', 'Golden Ratio'],
    gradient: 'from-cyan-500 to-teal-500',
    shadowColor: 'shadow-cyan-500/20',
    icon: Puzzle,
  },
  {
    path: '/games/dijkstra',
    title: 'Dijkstra Delivery Simulator',
    subtitle: 'Based on Edsger W. Dijkstra\'s shortest-path algorithm',
    description: 'Navigate a city graph as a delivery driver. Build your route node-by-node, then compare it to the optimal Dijkstra shortest path. Watch the algorithm run step-by-step with live priority queue updates.',
    skills: ['Graph Theory', 'Shortest Path', 'Greedy Algorithms', 'Priority Queues'],
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
    icon: Puzzle,
  },
  {
    path: '/games/battles',
    title: 'Algorithm Battles',
    subtitle: 'Head-to-head algorithm showdowns',
    description: 'Pit two sorting algorithms against each other on the same input. Watch them race side-by-side with live metrics, performance graphs, and detailed results. Predict the winner or just watch and learn.',
    skills: ['Sorting', 'Big-O Analysis', 'Performance', 'Comparison'],
    gradient: 'from-rose-500 to-orange-500',
    shadowColor: 'shadow-rose-500/20',
    icon: Swords,
  },
  {
    path: '/games/sudoku-solver',
    title: 'Sudoku Solver',
    subtitle: 'Constraint satisfaction via backtracking',
    description: 'Generate random Sudoku puzzles of different sizes and step through a backtracking solver. Go forward, backward, or solve instantly.',
    skills: ['Backtracking', 'Constraint Satisfaction', '4×4 / 9×9 / 16×16', 'Puzzle Solving'],
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    icon: Grid3X3,
  },
];

export default function GamesPage() {
  const location = useLocation();

  if (location.pathname === '/games') {
    return (
      <div className="flex-1 overflow-y-auto">
        <section className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1.5 ring-1 ring-cyan-500/20">
            <Puzzle size={14} className="text-cyan-400" />
            <span className="text-xs font-medium text-cyan-300">Interactive Games</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Learn Through <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Play</span>
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm text-slate-400 leading-relaxed">
            Explore mathematical concepts through engaging, interactive games.
          </p>
        </section>

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {games.map(({ path, title, subtitle, description, skills, gradient, shadowColor, icon: Icon }) => (
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
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Play <ArrowRight size={12} />
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
