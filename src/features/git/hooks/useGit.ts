import { useState, useCallback, useRef } from 'react';
import type { GitState, GitMode, TerminalLine, GuidedLesson } from '../types/git';
import { createInitialState, parseAndExecute } from '../engine/gitEngine';
import { useGitSound } from './useGitSound';
import { GUIDED_LESSONS } from '../data/lessons';

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
  'git remote add origin https://github.com/user/repo.git',
  'git push -u origin main',
  'git checkout -b feature/dashboard',
  'touch dashboard.js function render() {}',
  'git add .',
  'git commit -m "Add dashboard"',
  'git push -u origin feature/dashboard',
  'git checkout main',
  'git log --oneline --all',
];

export function useGit() {
  const [mode, setMode] = useState<GitMode>('freeplay');
  const [gitState, setGitState] = useState<GitState>(createInitialState());
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'info', text: 'Welcome to Git Visualizer! Type commands or click "Run Demo" to start.' },
    { type: 'info', text: 'Type "help" for available commands.\n' },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const demoAbortRef = useRef(false);
  const { soundEnabled, toggleSound, playForAction } = useGitSound();

  const [activeLesson, setActiveLesson] = useState<GuidedLesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const executeCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      setCommandHistory(prev => [...prev, trimmed]);

      const cmdResult = parseAndExecute(trimmed, gitState);

      const newLines: TerminalLine[] = [{ type: 'input', text: `$ ${trimmed}` }];

      if (cmdResult.output === '__CLEAR__') {
        setHistory([]);
        return;
      }

      if (cmdResult.output) {
        newLines.push({
          type: cmdResult.success ? 'output' : 'error',
          text: cmdResult.output,
        });
      }

      if (mode === 'guided' && activeLesson) {
        const step = activeLesson.steps[currentStep];
        if (step) {
          const matches =
            typeof step.expectedCommand === 'string'
              ? trimmed === step.expectedCommand
              : step.expectedCommand.test(trimmed);

          if (matches && cmdResult.success) {
            newLines.push({ type: 'info', text: `\n✓ ${step.explanation}\n` });

            if (currentStep + 1 < activeLesson.steps.length) {
              const nextStep = activeLesson.steps[currentStep + 1];
              newLines.push({ type: 'hint', text: `→ Step ${currentStep + 2}: ${nextStep.instruction}` });
              setCurrentStep(currentStep + 1);
            } else {
              newLines.push({ type: 'info', text: '\n🎉 Lesson complete! Great job!' });
              setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
            }
          } else if (!cmdResult.success) {
            // error already shown
          } else {
            newLines.push({ type: 'hint', text: `💡 Hint: ${step.hint}` });
          }
        }
      }

      setHistory(prev => [...prev, ...newLines]);
      setGitState(cmdResult.state);
      playForAction(cmdResult.action);
    },
    [gitState, playForAction, mode, activeLesson, currentStep],
  );

  const runDemo = useCallback(async () => {
    setIsRunningDemo(true);
    demoAbortRef.current = false;

    let currentState = createInitialState();
    setGitState(currentState);
    setHistory([{ type: 'info', text: '--- Running Demo ---\n' }]);
    setCommandHistory([]);

    for (const cmd of DEMO_COMMANDS) {
      if (demoAbortRef.current) break;

      await new Promise(r => setTimeout(r, 600));
      if (demoAbortRef.current) break;

      const cmdResult = parseAndExecute(cmd, currentState);
      currentState = cmdResult.state;

      const newLines: TerminalLine[] = [{ type: 'input', text: `$ ${cmd}` }];
      if (cmdResult.output && cmdResult.output !== '__CLEAR__') {
        newLines.push({
          type: cmdResult.success ? 'output' : 'error',
          text: cmdResult.output,
        });
      }

      setHistory(prev => [...prev, ...newLines]);
      setGitState(cmdResult.state);
      setCommandHistory(prev => [...prev, cmd]);
      playForAction(cmdResult.action);
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

  const switchMode = useCallback((newMode: GitMode) => {
    setMode(newMode);
    setActiveLesson(null);
    setCurrentStep(0);
    setGitState(createInitialState());
    setCommandHistory([]);
    setIsRunningDemo(false);
    demoAbortRef.current = true;

    if (newMode === 'guided') {
      setHistory([
        { type: 'info', text: '📚 Guided Mode — Choose a lesson from the panel to begin.\n' },
      ]);
    } else {
      setHistory([
        { type: 'info', text: 'Freeplay Mode — Type any git commands. Use "help" for a list.\n' },
      ]);
    }
  }, []);

  const startLesson = useCallback((lessonId: string) => {
    const lesson = GUIDED_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    setActiveLesson(lesson);
    setCurrentStep(0);
    setGitState(createInitialState());
    setCommandHistory([]);

    const firstStep = lesson.steps[0];
    setHistory([
      { type: 'info', text: `📖 ${lesson.title}\n` },
      { type: 'info', text: `${lesson.description}\n` },
      { type: 'hint', text: `→ Step 1: ${firstStep.instruction}` },
    ]);
  }, []);

  const restartLesson = useCallback(() => {
    if (activeLesson) startLesson(activeLesson.id);
  }, [activeLesson, startLesson]);

  return {
    mode,
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
    switchMode,
    activeLesson,
    currentStep,
    completedLessons,
    startLesson,
    restartLesson,
    lessons: GUIDED_LESSONS,
  };
}
