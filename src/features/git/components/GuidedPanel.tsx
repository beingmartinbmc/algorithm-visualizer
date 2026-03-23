import { memo } from 'react';
import type { GuidedLesson } from '../types/git';

interface LessonListProps {
  lessons: GuidedLesson[];
  completedLessons: Set<string>;
  activeLessonId?: string;
  onSelect: (id: string) => void;
}

function GuidedPanelInner({ lessons, completedLessons, activeLessonId, onSelect }: LessonListProps) {
  const difficultyColor = (d: GuidedLesson['difficulty']) => {
    switch (d) {
      case 'beginner': return 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/30';
      case 'intermediate': return 'text-amber-400 bg-amber-500/10 ring-amber-500/30';
      case 'advanced': return 'text-rose-400 bg-rose-500/10 ring-rose-500/30';
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span className="text-xs font-semibold text-slate-300">Guided Lessons</span>
        <span className="ml-auto text-[10px] text-slate-500">
          {completedLessons.size}/{lessons.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {lessons.map((lesson) => {
          const isCompleted = completedLessons.has(lesson.id);
          const isActive = lesson.id === activeLessonId;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson.id)}
              className={`
                flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all
                ${isActive
                  ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30'
                  : 'hover:bg-slate-800/40'
                }
              `}
            >
              <div className={`
                flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold
                ${isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-800/60 text-slate-500'
                }
              `}>
                {isCompleted ? '✓' : lesson.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {lesson.title}
                  </span>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium ring-1 ${difficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                  {lesson.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const GuidedPanel = memo(GuidedPanelInner);

interface StepProgressProps {
  lesson: GuidedLesson;
  currentStep: number;
  onRestart: () => void;
}

function StepProgressInner({ lesson, currentStep, onRestart }: StepProgressProps) {
  const totalSteps = lesson.steps.length;
  const isComplete = currentStep >= totalSteps;
  const progress = isComplete ? 100 : (currentStep / totalSteps) * 100;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-300">{lesson.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">
            {isComplete ? 'Complete!' : `Step ${currentStep + 1}/${totalSteps}`}
          </span>
          <button
            onClick={onRestart}
            className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors"
            title="Restart lesson"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-800/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isComplete && (
        <div className="mt-2.5 rounded-lg bg-slate-800/40 px-2.5 py-2">
          <p className="text-[10px] text-indigo-300 font-medium">
            {lesson.steps[currentStep].instruction}
          </p>
          <p className="text-[9px] text-slate-500 mt-1">
            💡 {lesson.steps[currentStep].hint}
          </p>
        </div>
      )}
    </div>
  );
}

export const StepProgress = memo(StepProgressInner);
