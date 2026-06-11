import { useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';

interface Props {
  /** Pseudocode lines (already indented with leading spaces as desired). */
  pseudocode: string[];
  /** Index of the line currently being executed, or null/undefined for none. */
  activeLine?: number | null;
  /** Optional small heading shown above the code. */
  title?: string;
  /** Optional language tag shown in the header (e.g. "pseudocode"). */
  language?: string;
}

/**
 * Reusable animated code panel.
 *
 * Renders a block of pseudocode and highlights the line the current animation
 * step is executing. The highlight transitions smoothly and the active line is
 * scrolled into view, so the code "plays" alongside the visualization.
 *
 * Used across the Algorithms section (linked-list problems + playground demos)
 * and intentionally generic so sorting / tree / graph can adopt it later.
 */
export default function AlgorithmCodePanel({ pseudocode, activeLine = null, title = 'Code', language = 'pseudocode' }: Props) {
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Keep the executing line visible as playback advances.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeLine]);

  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Code2 size={13} className="text-indigo-400" /> {title}
        </h3>
        <span className="rounded-full bg-slate-800/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-slate-500">{language}</span>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl bg-slate-950/70 p-2 ring-1 ring-slate-800/70">
        <pre className="font-mono text-[11px] leading-relaxed">
          {pseudocode.map((line, index) => {
            const isActive = index === activeLine;
            return (
              <div
                key={index}
                ref={isActive ? activeRef : null}
                className={`flex gap-3 rounded-md px-2 py-0.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-500/40'
                    : 'text-slate-400'
                }`}
              >
                <span className={`select-none text-right tabular-nums ${isActive ? 'text-indigo-300' : 'text-slate-600'}`} style={{ minWidth: '1.6rem' }}>
                  {index + 1}
                </span>
                <span className="whitespace-pre">{line.length ? line : ' '}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </section>
  );
}
