import { useState, useCallback, useRef } from 'react';
import type { GitState, TerminalLine } from '../types/git';
import { createInitialState, parseAndExecute } from '../engine/gitEngine';
import { useGitSound } from './useGitSound';

const DEMO_COMMANDS = [
  'git init',
  'touch index.html <!DOCTYPE html>',
  'touch style.css body { margin: 0; }',
  'git add .',
  'git commit -m "Initial commit"',
  'git checkout -b feature/login',
  'touch auth.js function login() {}',
  'git add auth.js',
  'git commit -m "Add login feature"',
  'git checkout main',
  'touch README.md # My Project',
  'git add README.md',
  'git commit -m "Add README"',
  'git merge feature/login',
  'git checkout -b feature/dashboard',
  'touch dashboard.js function render() {}',
  'git add .',
  'git commit -m "Add dashboard"',
  'git checkout main',
  'git log --oneline --all',
];

export function useGit() {
  const [gitState, setGitState] = useState<GitState>(createInitialState());
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'info', text: 'Welcome to Git Visualizer! Type commands or click "Run Demo" to start.' },
    { type: 'info', text: 'Type "help" for available commands.\n' },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const demoAbortRef = useRef(false);
  const { soundEnabled, toggleSound, playForAction } = useGitSound();

  const executeCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      setCommandHistory(prev => [...prev, trimmed]);

      const result = parseAndExecute(trimmed, gitState);

      const newLines: TerminalLine[] = [{ type: 'input', text: `$ ${trimmed}` }];

      if (result.output === '__CLEAR__') {
        setHistory([]);
        return;
      }

      if (result.output) {
        newLines.push({
          type: result.success ? 'output' : 'error',
          text: result.output,
        });
      }

      setHistory(prev => [...prev, ...newLines]);
      setGitState(result.state);
      playForAction(result.action);
    },
    [gitState, playForAction],
  );

  const runDemo = useCallback(async () => {
    setIsRunningDemo(true);
    demoAbortRef.current = false;

    let currentState = createInitialState();
    setGitState(currentState);
    setHistory([
      { type: 'info', text: '--- Running Demo ---\n' },
    ]);
    setCommandHistory([]);

    for (const cmd of DEMO_COMMANDS) {
      if (demoAbortRef.current) break;

      await new Promise(r => setTimeout(r, 600));
      if (demoAbortRef.current) break;

      const result = parseAndExecute(cmd, currentState);
      currentState = result.state;

      const newLines: TerminalLine[] = [{ type: 'input', text: `$ ${cmd}` }];
      if (result.output && result.output !== '__CLEAR__') {
        newLines.push({
          type: result.success ? 'output' : 'error',
          text: result.output,
        });
      }

      setHistory(prev => [...prev, ...newLines]);
      setGitState(result.state);
      setCommandHistory(prev => [...prev, cmd]);
      playForAction(result.action);
    }

    if (!demoAbortRef.current) {
      setHistory(prev => [
        ...prev,
        { type: 'info', text: '\n--- Demo Complete! Try your own commands. ---' },
      ]);
    }
    setIsRunningDemo(false);
  }, [playForAction]);

  const stopDemo = useCallback(() => {
    demoAbortRef.current = true;
    setIsRunningDemo(false);
  }, []);

  const resetState = useCallback(() => {
    setGitState(createInitialState());
    setHistory([
      { type: 'info', text: 'Repository reset. Type "help" for available commands.\n' },
    ]);
    setCommandHistory([]);
    setIsRunningDemo(false);
    demoAbortRef.current = true;
  }, []);

  return {
    gitState,
    history,
    commandHistory,
    isRunningDemo,
    soundEnabled,
    toggleSound,
    executeCommand,
    runDemo,
    stopDemo,
    resetState,
  };
}
