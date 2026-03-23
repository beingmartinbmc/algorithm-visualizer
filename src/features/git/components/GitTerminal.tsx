import { useState, useRef, useEffect, useCallback, memo } from 'react';
import type { TerminalLine } from '../types/git';

interface Props {
  history: TerminalLine[];
  commandHistory: string[];
  onExecute: (cmd: string) => void;
  disabled?: boolean;
}

function GitTerminalInner({ history, commandHistory, onExecute, disabled }: Props) {
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
      default: return 'text-slate-300';
    }
  };

  return (
    <div
      className="flex flex-col rounded-xl border border-slate-700/50 bg-slate-950/80 backdrop-blur-sm overflow-hidden font-mono text-xs"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 ml-2">Git Terminal</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 min-h-[200px] max-h-[50vh]">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${lineColor(line.type)}`}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-800/60 px-3 py-2 bg-slate-900/40">
        <span className="text-emerald-500 font-bold select-none">$</span>
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
