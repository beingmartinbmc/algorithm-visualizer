import { memo } from 'react';
import type { GitState } from '../types/git';

interface Props {
  state: GitState;
}

function GitFileStatusInner({ state }: Props) {
  const { workingDirectory, stagingArea, commits, head, detachedHead, branches } = state;

  const headCommitId = detachedHead
    ? head
    : branches.find(b => b.name === head)?.commitId ?? null;
  const headCommit = headCommitId ? commits[headCommitId] : null;
  const committedFiles = headCommit?.files ?? {};

  const wdFiles = Object.keys(workingDirectory);
  const stagedFiles = Object.keys(stagingArea);

  const getFileStatus = (file: string) => {
    if (file in stagingArea) return 'staged';
    if (!(file in committedFiles)) return 'untracked';
    if (workingDirectory[file] !== committedFiles[file]) return 'modified';
    return 'clean';
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'staged': return 'text-emerald-400 bg-emerald-500/10';
      case 'modified': return 'text-amber-400 bg-amber-500/10';
      case 'untracked': return 'text-red-400 bg-red-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'staged': return 'S';
      case 'modified': return 'M';
      case 'untracked': return 'U';
      default: return '✓';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Working Directory */}
      <div className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-3 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h5" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Working Dir</span>
          <span className="ml-auto text-[10px] text-slate-600">{wdFiles.length}</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {wdFiles.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">empty</p>
          ) : (
            wdFiles.map(file => {
              const status = getFileStatus(file);
              return (
                <div key={file} className="flex items-center gap-1.5 rounded-lg bg-slate-900/50 px-1.5 py-1 ring-1 ring-slate-800/50">
                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold ${statusColor(status)}`}>
                    {statusLabel(status)}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{file}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Staging Area */}
      <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-3 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Staging</span>
          <span className="ml-auto text-[10px] text-slate-600">{stagedFiles.length}</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {stagedFiles.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">empty</p>
          ) : (
            stagedFiles.map(file => (
              <div key={file} className="flex items-center gap-1.5 rounded-lg bg-slate-900/50 px-1.5 py-1 ring-1 ring-slate-800/50">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-emerald-400 bg-emerald-500/10">
                  +
                </span>
                <span className="text-[10px] text-slate-400 truncate">{file}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Repository */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-950/70 p-3 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Repository</span>
          <span className="ml-auto text-[10px] text-slate-600">{Object.keys(committedFiles).length}</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.keys(committedFiles).length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">no commits</p>
          ) : (
            Object.keys(committedFiles).map(file => (
              <div key={file} className="flex items-center gap-1.5 rounded-lg bg-slate-900/50 px-1.5 py-1 ring-1 ring-slate-800/50">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-indigo-400 bg-indigo-500/10">
                  ✓
                </span>
                <span className="text-[10px] text-slate-400 truncate">{file}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const GitFileStatus = memo(GitFileStatusInner);
