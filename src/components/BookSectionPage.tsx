import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOK_CHAPTERS, getBookChapter, type BookChapter } from '@/content/book';

export default function BookSectionPage({ chapterId }: { chapterId: BookChapter['id'] }) {
  const chapter = getBookChapter(chapterId);
  const currentIndex = BOOK_CHAPTERS.findIndex((item) => item.id === chapterId);
  const nextChapter = BOOK_CHAPTERS[currentIndex + 1];

  return (
    <div className="book-page flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Table of contents</p>
            <nav aria-label="Book chapters" className="space-y-1">
              {BOOK_CHAPTERS.map((item) => {
                const active = item.id === chapterId;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? `${item.accent.soft} ${item.accent.text} ring-1 ${item.accent.border}`
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-7 font-mono text-[10px] font-bold tracking-wider opacity-70">{item.number}</span>
                    <span className="font-medium">{item.shortTitle}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main>
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="transition-colors hover:text-slate-200">Handbook</Link>
            <span aria-hidden="true">/</span>
            <span className={chapter.accent.text}>Chapter {chapter.number}</span>
          </nav>

          <header className="book-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${chapter.accent.gradient}`} />
            <div className="relative max-w-3xl">
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ${chapter.accent.soft} ${chapter.accent.text} ${chapter.accent.border}`}>
                <BookOpen size={13} /> Chapter {chapter.number}
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">{chapter.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{chapter.description}</p>
              <div className="mt-7 flex items-start gap-3 rounded-xl border border-white/8 bg-black/15 p-4">
                <CheckCircle2 size={17} className={`mt-0.5 shrink-0 ${chapter.accent.text}`} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Learning outcome</p>
                  <p className="mt-1 text-sm text-slate-300">{chapter.outcome}</p>
                </div>
              </div>
            </div>
          </header>

          <section className="mt-10" aria-labelledby="reading-map-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${chapter.accent.text}`}>Reading map</p>
                <h2 id="reading-map-title" className="mt-1 text-2xl font-semibold text-white">Topics in this chapter</h2>
              </div>
              <span className="hidden text-xs text-slate-500 sm:block">{chapter.topics.length} interactive lessons</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chapter.topics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <Link key={topic.path} to={topic.path} className="book-topic-card group flex min-h-64 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${chapter.accent.soft} ${chapter.accent.text} ${chapter.accent.border}`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-slate-600">
                        {chapter.number}.{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-white group-hover:text-white">{topic.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{topic.subtitle}</p>
                    <p className="mt-3 flex-1 text-xs leading-6 text-slate-400">{topic.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {topic.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/[0.045] px-2 py-1 text-[9px] font-medium text-slate-500 ring-1 ring-white/[0.06]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className={`mt-5 inline-flex items-center gap-1 text-xs font-semibold ${chapter.accent.text}`}>
                      Open lesson <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {nextChapter && (
            <Link to={nextChapter.path} className="book-panel group mt-10 flex items-center justify-between gap-5 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Continue reading</p>
                <p className="mt-1 text-lg font-semibold text-white">{nextChapter.number} · {nextChapter.title}</p>
              </div>
              <ArrowRight className={`${nextChapter.accent.text} transition-transform group-hover:translate-x-1`} />
            </Link>
          )}
        </main>
      </div>
    </div>
  );
}
