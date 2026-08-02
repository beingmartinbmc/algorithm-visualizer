import { useCallback, useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BOOK_CHAPTERS, type BookChapter } from '@/content/book';

function isChapterActive(chapter: BookChapter, pathname: string): boolean {
  if (chapter.id === 'algorithms' && (pathname.startsWith('/traversals') || pathname === '/sorting')) return true;
  return pathname === chapter.path || pathname.startsWith(`${chapter.path}/`);
}

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="relative z-50 shrink-0 border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="group flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/10 transition-transform group-hover:-rotate-3">
            <BookOpen size={18} strokeWidth={2.3} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-semibold tracking-tight text-white">Algorithm Atlas</span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 sm:block">Interactive handbook</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {BOOK_CHAPTERS.map((chapter) => {
            const active = isChapterActive(chapter, pathname);
            const Icon = chapter.icon;
            return (
              <Link
                key={chapter.id}
                to={chapter.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? `${chapter.accent.soft} ${chapter.accent.text} ring-1 ${chapter.accent.border}`
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span className="font-mono text-[9px] opacity-60">{chapter.number}</span>
                {chapter.shortTitle}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          aria-label={menuOpen ? 'Close table of contents' : 'Open table of contents'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="absolute inset-x-0 top-full border-b border-white/[0.07] bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Table of contents</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {BOOK_CHAPTERS.map((chapter) => {
              const active = isChapterActive(chapter, pathname);
              const Icon = chapter.icon;
              return (
                <Link
                  key={chapter.id}
                  to={chapter.path}
                  onClick={closeMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    active ? `${chapter.accent.soft} ${chapter.accent.text}` : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="w-8 font-mono text-[10px] opacity-60">{chapter.number}</span>
                  {chapter.title}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
