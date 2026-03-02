import {
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  RotateCcw,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import type { SearchMode, TrieStep } from '../types/trie';

interface TrieControlsProps {
  words: string[];
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  query: string;
  setQuery: (q: string) => void;
  steps: TrieStep[];
  stepIndex: number;
  searchResults: string[];
  isPlaying: boolean;
  speed: number;
  setSpeed: (s: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onSearch: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  newWord: string;
  setNewWord: (w: string) => void;
  onAddWord: () => void;
  onRemoveWord: (word: string) => void;
  onLoadSample: () => void;
}

export default function TrieControls({
  words,
  searchMode,
  setSearchMode,
  query,
  setQuery,
  steps,
  stepIndex,
  searchResults,
  isPlaying,
  canGoNext,
  canGoPrev,
  onSearch,
  onNextStep,
  onPrevStep,
  onPlay,
  onStop,
  onReset,
  newWord,
  setNewWord,
  onAddWord,
  onRemoveWord,
  onLoadSample,
}: TrieControlsProps) {
  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

  return (
    <div className="flex flex-col gap-4 w-full md:w-72 shrink-0 overflow-y-auto max-h-full pr-1">
      {/* Search Mode */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Search Mode
        </h3>
        <div className="flex gap-2">
          {(['prefix', 'word'] as SearchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={`
                flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${searchMode === mode
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }
              `}
            >
              {mode === 'prefix' ? 'Prefix' : 'Full Word'}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Search
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder={searchMode === 'prefix' ? 'Type a prefix...' : 'Type a word...'}
            className="flex-1 rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50"
          />
          <button
            onClick={onSearch}
            disabled={!query.trim()}
            className="flex items-center justify-center rounded-lg bg-indigo-500/20 px-3 py-2 text-indigo-300 ring-1 ring-indigo-500/40 transition-all hover:bg-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Step Controls */}
      {steps.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Steps
          </h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={onPrevStep}
              disabled={!canGoPrev || isPlaying}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {!isPlaying ? (
              <button
                onClick={onPlay}
                disabled={steps.length === 0}
                className="flex items-center justify-center rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Play size={16} />
              </button>
            ) : (
              <button
                onClick={onStop}
                className="flex items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 ring-1 ring-rose-500/30 transition-all hover:bg-rose-500/25"
              >
                <Square size={14} />
              </button>
            )}
            <button
              onClick={onNextStep}
              disabled={!canGoNext || isPlaying}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-sm font-mono font-semibold text-indigo-400">
              {Math.max(0, stepIndex + 1)} / {steps.length}
            </span>
          </div>
          {currentStep && (
            <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
              currentStep.action === 'match' || currentStep.action === 'prefix-match'
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                : currentStep.action === 'not-found'
                  ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
                  : 'bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/50'
            }`}>
              {currentStep.description}
            </div>
          )}
          <button
            onClick={onReset}
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
          >
            <RotateCcw size={12} /> Clear Search
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Results ({searchResults.length})
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {searchResults.map((word) => (
              <span
                key={word}
                className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/20"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Words in Trie */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Words ({words.length})
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddWord()}
            placeholder="Add a word..."
            className="flex-1 rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700/50 focus:ring-indigo-500/50"
          />
          <button
            onClick={onAddWord}
            disabled={!newWord.trim()}
            className="flex items-center justify-center rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-300 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {words.map((word) => (
            <span
              key={word}
              className="group inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 ring-1 ring-slate-700/40"
            >
              {word}
              <button
                onClick={() => onRemoveWord(word)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <button
          onClick={onLoadSample}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-300"
        >
          <RefreshCw size={12} /> Load Sample Words
        </button>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-700 ring-1 ring-slate-500" />
            <span className="text-xs text-slate-400">Normal Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-900 ring-1 ring-indigo-500" />
            <span className="text-xs text-slate-400">Matched Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-900 ring-2 ring-indigo-400" />
            <span className="text-xs text-slate-400">Current Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-3 w-3 rounded-full bg-slate-700 ring-1 ring-emerald-500">
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">End of Word</span>
          </div>
        </div>
      </div>
    </div>
  );
}
