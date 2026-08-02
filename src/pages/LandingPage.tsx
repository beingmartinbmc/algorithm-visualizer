import { ArrowRight, BookMarked, Braces, Eye, ListTree, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOK_CHAPTERS } from '@/content/book';

const READING_STEPS = [
  {
    icon: BookMarked,
    number: '01',
    title: 'Read the idea',
    description: 'Start with the purpose, invariants, and complexity before touching the controls.',
  },
  {
    icon: MousePointer2,
    number: '02',
    title: 'Change the input',
    description: 'Try edge cases, move one step at a time, and predict the next state.',
  },
  {
    icon: Eye,
    number: '03',
    title: 'Watch state move',
    description: 'Follow pointers, frontiers, arrays, and call stacks as the algorithm runs.',
  },
];

export default function LandingPage() {
  const lessonCount = BOOK_CHAPTERS.reduce((count, chapter) => count + Math.max(1, chapter.topics.length), 0);

  return (
    <div className="book-page flex-1 overflow-y-auto">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
              <BookMarked size={13} /> A visual computer science handbook
            </div>
            <h1 className="font-display mt-7 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Learn algorithms as
              <span className="block bg-gradient-to-r from-amber-200 via-orange-200 to-rose-300 bg-clip-text text-transparent">ideas you can see.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              A structured path through data structures, algorithms, practice challenges, and developer tools—each paired with an interactive visualization.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/data-structures" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-200">
                Start chapter one <ArrowRight size={16} />
              </Link>
              <Link to="/visualize-code" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-300/8 hover:text-emerald-200">
                <Braces size={16} /> Visualize your code
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
              <span><strong className="mr-1 font-mono text-slate-300">{lessonCount}</strong>interactive lessons</span>
              <span><strong className="mr-1 font-mono text-slate-300">100%</strong>browser based</span>
              <span><strong className="mr-1 font-mono text-slate-300">0</strong>tracking scripts</span>
            </div>
          </div>

          <aside className="book-panel p-4 sm:p-5" aria-label="Table of contents">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-2 pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">The handbook</p>
                <h2 className="mt-1 text-sm font-semibold text-white">Table of contents</h2>
              </div>
              <ListTree size={18} className="text-amber-300" />
            </div>
            <nav className="mt-2 space-y-1">
              {BOOK_CHAPTERS.map((chapter) => {
                const Icon = chapter.icon;
                return (
                  <Link key={chapter.id} to={chapter.path} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.045]">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${chapter.accent.soft} ${chapter.accent.text} ${chapter.accent.border}`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{chapter.number}</span>
                      <span className="block truncate text-sm font-medium text-slate-300 group-hover:text-white">{chapter.title}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-700">{Math.max(1, chapter.topics.length)}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </section>

        <section className="mt-20 border-y border-white/[0.07] py-8 sm:py-10" aria-labelledby="reading-title">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">How to use the atlas</p>
            <h2 id="reading-title" className="mt-2 text-2xl font-semibold text-white">A repeatable way to build intuition</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {READING_STEPS.map(({ icon: Icon, number, title, description }) => (
              <article key={number} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-amber-300" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-700">STEP {number}</span>
                </div>
                <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="chapters-title">
          <div className="mb-7 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">The curriculum</p>
            <h2 id="chapters-title" className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">Chapters built around mental models</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Follow the order or jump directly to the concept you need. Existing URLs remain intact.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {BOOK_CHAPTERS.map((chapter) => {
              const Icon = chapter.icon;
              return (
                <Link key={chapter.id} to={chapter.path} className="book-topic-card group flex min-h-72 flex-col p-6">
                  <div className="flex items-start justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${chapter.accent.soft} ${chapter.accent.text} ${chapter.accent.border}`}>
                      <Icon size={19} />
                    </span>
                    <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-600">{chapter.number}</span>
                  </div>
                  <h3 className="font-display mt-6 text-xl font-semibold text-white">{chapter.title}</h3>
                  <p className="mt-3 flex-1 text-xs leading-6 text-slate-400">{chapter.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="text-[10px] font-medium text-slate-600">{Math.max(1, chapter.topics.length)} {chapter.topics.length === 1 ? 'lesson' : 'lessons'}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${chapter.accent.text}`}>
                      Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] px-4 py-6 text-center text-[10px] text-slate-600">
        Algorithm Atlas · Learn by reading, changing, and watching state.
      </footer>
    </div>
  );
}
