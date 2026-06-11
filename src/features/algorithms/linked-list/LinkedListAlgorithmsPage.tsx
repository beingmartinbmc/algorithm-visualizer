import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GitFork, Layers, Link2, Network, Repeat, RotateCcw, Scissors, Sigma, SkipBack, Spline } from 'lucide-react';
import type { LLProblem } from './types/linkedListAlgo';
import { PROBLEM_INFO } from './types/linkedListAlgo';

/** Display metadata (icon + gradient) for each linked-list problem card. */
const CARD_STYLE: Record<LLProblem, { gradient: string; shadowColor: string; icon: typeof Link2 }> = {
  'find-middle': { gradient: 'from-sky-500 to-cyan-500', shadowColor: 'shadow-sky-500/20', icon: Link2 },
  'reverse-list': { gradient: 'from-rose-500 to-pink-500', shadowColor: 'shadow-rose-500/20', icon: RotateCcw },
  'add-two-numbers': { gradient: 'from-blue-500 to-indigo-500', shadowColor: 'shadow-blue-500/20', icon: Sigma },
  'reverse-k-group': { gradient: 'from-purple-500 to-fuchsia-500', shadowColor: 'shadow-purple-500/20', icon: SkipBack },
  palindrome: { gradient: 'from-fuchsia-500 to-pink-500', shadowColor: 'shadow-fuchsia-500/20', icon: Spline },
  'lru-cache': { gradient: 'from-emerald-500 to-teal-500', shadowColor: 'shadow-emerald-500/20', icon: Layers },
  segregate: { gradient: 'from-lime-500 to-green-500', shadowColor: 'shadow-lime-500/20', icon: Scissors },
  'detect-cycle': { gradient: 'from-amber-500 to-orange-500', shadowColor: 'shadow-amber-500/20', icon: Repeat },
  'sort-list': { gradient: 'from-indigo-500 to-violet-500', shadowColor: 'shadow-indigo-500/20', icon: GitFork },
};

const PROBLEM_ORDER: LLProblem[] = ['find-middle', 'reverse-list', 'add-two-numbers', 'reverse-k-group', 'palindrome', 'lru-cache', 'segregate', 'detect-cycle', 'sort-list'];

export default function LinkedListAlgorithmsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <section className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        <Link
          to="/algorithms"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-400 ring-1 ring-slate-700/50 transition-colors hover:text-indigo-300"
        >
          <ArrowLeft size={13} /> Back to Algorithms
        </Link>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 ring-1 ring-indigo-500/20">
          <Network size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300">Linked List Algorithms</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Linked <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">List</span>
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-400 leading-relaxed">
          Two-pointer tricks, Floyd's cycle detection, merge sort, and an LRU cache — each with step playback, a speed slider, and audio feedback.
        </p>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEM_ORDER.map((problem) => {
            const info = PROBLEM_INFO[problem];
            const { gradient, shadowColor, icon: Icon } = CARD_STYLE[problem];
            return (
              <Link
                key={problem}
                to={`/algorithms/linked-list/${problem}`}
                className={`group relative flex flex-col rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-slate-600/60 hover:bg-slate-900/70 ${shadowColor}`}
              >
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-base font-bold text-white">{info.title}</h4>
                <p className="text-[10px] text-slate-500 italic">{info.subtitle}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">{info.helper}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {info.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
