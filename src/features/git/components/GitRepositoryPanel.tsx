import { memo } from 'react';
import type { ReactNode } from 'react';
import type { GitState } from '../types/git';

interface Props {
  state: GitState;
}

function GitRepositoryPanelInner({ state }: Props) {
  const currentBranch = state.detachedHead ? null : state.head;
  const headCommitId = state.detachedHead
    ? state.head
    : state.branches.find((branch) => branch.name === state.head)?.commitId ?? '';
  const committedFiles = headCommitId ? state.commits[headCommitId]?.files ?? {} : {};
  const stagedCount = Object.keys(state.stagingArea).length;
  const modifiedCount = Object.keys(state.workingDirectory).filter((file) => (
    file in committedFiles && state.workingDirectory[file] !== committedFiles[file] && !(file in state.stagingArea)
  )).length;
  const untrackedCount = Object.keys(state.workingDirectory).filter((file) => !(file in committedFiles)).length;

  return (
    <aside className="flex flex-col gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-sm lg:w-64 lg:shrink-0">
      <div className="rounded-xl border border-slate-700/40 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_38%),rgba(15,23,42,0.8)] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 0 0 9 9" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">visual-repo</div>
            <div className="text-[10px] text-slate-500">{state.initialized ? 'Git repository' : 'No repository'}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <Stat label="Commits" value={state.commitOrder.length} />
          <Stat label="Files" value={Object.keys(state.workingDirectory).length} />
          <Stat label="Stash" value={state.stash.length} />
        </div>
      </div>

      <Panel title="Working Tree">
        <StatusPill label="Staged" value={stagedCount} color="emerald" />
        <StatusPill label="Modified" value={modifiedCount} color="amber" />
        <StatusPill label="Untracked" value={untrackedCount} color="rose" />
      </Panel>

      <Panel title="Branches">
        {state.branches.length === 0 ? (
          <EmptyText>No branches</EmptyText>
        ) : (
          <div className="space-y-1">
            {state.branches.map((branch) => (
              <div
                key={branch.name}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                  branch.name === currentBranch
                    ? 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/25'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${branch.name === currentBranch ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                <span className="truncate font-mono">{branch.name}</span>
                <span className="ml-auto font-mono text-[9px] text-slate-600">{branch.commitId.slice(0, 4) || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Remotes">
        {state.remotes.length === 0 ? (
          <EmptyText>No remotes configured</EmptyText>
        ) : (
          <div className="space-y-1">
            {state.remotes.map((remote) => (
              <div key={remote.name} className="rounded-lg bg-slate-900/60 px-2 py-1.5 ring-1 ring-slate-800/70">
                <div className="font-mono text-[11px] text-sky-300">{remote.name}</div>
                <div className="truncate text-[9px] text-slate-600">{remote.url}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Tags & Stash">
        <div className="space-y-1.5">
          {state.tags.length === 0 ? <EmptyText>No tags</EmptyText> : state.tags.map((tag) => (
            <div key={tag.name} className="rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-mono text-amber-300 ring-1 ring-amber-500/20">
              tag: {tag.name}
            </div>
          ))}
          {state.stash.length > 0 && state.stash.map((entry, index) => (
            <div key={entry.id} className="rounded-lg bg-violet-500/10 px-2 py-1 text-[11px] text-violet-300 ring-1 ring-violet-500/20">
              stash@{'{'}{index}{'}'} {entry.message}
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/55 p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-950/55 px-2 py-1.5 text-center ring-1 ring-slate-800/80">
      <div className="text-[9px] text-slate-600">{label}</div>
      <div className="font-mono text-xs font-bold text-slate-200">{value}</div>
    </div>
  );
}

function StatusPill({ label, value, color }: { label: string; value: number; color: 'emerald' | 'amber' | 'rose' }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
  };
  return (
    <div className={`mb-1 flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] ring-1 ${colorMap[color]}`}>
      <span>{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-[11px] italic text-slate-600">{children}</p>;
}

export const GitRepositoryPanel = memo(GitRepositoryPanelInner);
