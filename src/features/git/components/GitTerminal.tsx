import { useState, useRef, useEffect, useCallback, memo } from 'react';
import type { TerminalLine } from '../types/git';

interface Props {
  history: TerminalLine[];
  commandHistory: string[];
  onExecute: (cmd: string) => void;
  disabled?: boolean;
  promptBranch?: string;
}

function GitTerminalInner({ history, commandHistory, onExecute, disabled, promptBranch = 'main' }: Props) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || disabled) return;
      onExecute(input);
      setInput('');
      setHistoryIndex(-1);
    },
    [input, disabled, onExecute],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length === 0) return;
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    },
    [commandHistory, historyIndex],
  );

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-indigo-400';
      case 'hint': return 'text-amber-400/90';
      default: return 'text-slate-300';
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/90 font-mono text-xs shadow-2xl shadow-black/30 backdrop-blur-sm"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-slate-700/50 bg-slate-900/80 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-2 text-[10px] font-semibold text-slate-400">Git Terminal</span>
        <span className="ml-auto rounded bg-slate-950/80 px-2 py-0.5 text-[9px] text-slate-500 ring-1 ring-slate-800">~/visual-repo</span>
      </div>

      <div className="min-h-[240px] flex-1 space-y-0.5 overflow-y-auto bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[length:100%_22px] p-3">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${lineColor(line.type)}`}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-800/60 bg-slate-900/70 px-3 py-2">
        <span className="select-none text-sky-400">visual-repo</span>
        <span className="select-none text-slate-600">git:({promptBranch})</span>
        <span className="select-none font-bold text-emerald-500">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Demo running...' : 'Type a git command...'}
          className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 outline-none caret-emerald-400"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}

export const GitTerminal = memo(GitTerminalInner);
