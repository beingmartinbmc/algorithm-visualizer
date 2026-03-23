import { useState, memo } from 'react';

const COMMAND_GROUPS = [
  {
    title: 'Setup',
    commands: [
      { cmd: 'git init', desc: 'Initialize a new repository' },
    ],
  },
  {
    title: 'File Ops',
    commands: [
      { cmd: 'touch <file> [content]', desc: 'Create a new file' },
      { cmd: 'edit <file> <content>', desc: 'Modify a file' },
      { cmd: 'rm <file>', desc: 'Delete a file' },
      { cmd: 'ls', desc: 'List files' },
    ],
  },
  {
    title: 'Staging & Committing',
    commands: [
      { cmd: 'git add <file|.>', desc: 'Stage changes' },
      { cmd: 'git commit -m "msg"', desc: 'Create a commit' },
      { cmd: 'git status', desc: 'Show status' },
      { cmd: 'git diff', desc: 'Show differences' },
      { cmd: 'git log --oneline --all', desc: 'View history' },
    ],
  },
  {
    title: 'Branching',
    commands: [
      { cmd: 'git branch <name>', desc: 'Create branch' },
      { cmd: 'git branch', desc: 'List branches' },
      { cmd: 'git checkout <branch>', desc: 'Switch branches' },
      { cmd: 'git checkout -b <name>', desc: 'Create & switch' },
    ],
  },
  {
    title: 'Merging & Rebasing',
    commands: [
      { cmd: 'git merge <branch>', desc: 'Merge a branch' },
      { cmd: 'git rebase <branch>', desc: 'Rebase onto branch' },
      { cmd: 'git cherry-pick <id>', desc: 'Apply a commit' },
    ],
  },
  {
    title: 'Undo & Stash',
    commands: [
      { cmd: 'git reset --soft HEAD~1', desc: 'Soft reset' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Hard reset' },
      { cmd: 'git stash', desc: 'Stash changes' },
      { cmd: 'git stash pop', desc: 'Restore stash' },
    ],
  },
  {
    title: 'Tags',
    commands: [
      { cmd: 'git tag <name>', desc: 'Create a tag' },
      { cmd: 'git tag', desc: 'List tags' },
    ],
  },
];

interface Props {
  onRunCommand: (cmd: string) => void;
  disabled?: boolean;
}

function GitCommandRefInner({ onRunCommand, disabled }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        <span className="text-xs font-semibold text-slate-300">Command Reference</span>
      </div>

      <div className="space-y-1">
        {COMMAND_GROUPS.map(group => (
          <div key={group.title}>
            <button
              onClick={() => setExpanded(expanded === group.title ? null : group.title)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:bg-slate-800/40 transition-colors"
            >
              {group.title}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${expanded === group.title ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {expanded === group.title && (
              <div className="ml-2 space-y-0.5 pb-1">
                {group.commands.map(({ cmd, desc }) => {
                  const isClickable = !cmd.includes('<') && !cmd.includes('[');
                  return (
                    <button
                      key={cmd}
                      onClick={() => isClickable && !disabled && onRunCommand(cmd)}
                      disabled={disabled || !isClickable}
                      className={`
                        flex w-full items-start gap-2 rounded px-2 py-1 text-left transition-colors
                        ${isClickable && !disabled
                          ? 'hover:bg-indigo-500/10 cursor-pointer'
                          : 'cursor-default opacity-75'
                        }
                      `}
                    >
                      <code className="text-[10px] text-emerald-400 font-mono whitespace-nowrap">{cmd}</code>
                      <span className="text-[9px] text-slate-500 mt-px">{desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const GitCommandRef = memo(GitCommandRefInner);
