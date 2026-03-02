import { useEffect, useRef, useState } from 'react';
import TrieCanvas from './components/TrieCanvas';
import TrieControls from './components/TrieControls';
import { useTrie } from './hooks/useTrie';
import { useTrieSound } from './hooks/useTrieSound';

export default function TriePage() {
  const {
    words,
    layout,
    searchMode,
    setSearchMode,
    query,
    setQuery,
    steps,
    stepIndex,
    currentStepNodeId,
    matchedNodeIds,
    searchResults,
    isPlaying,
    speed,
    setSpeed,
    canGoNext,
    canGoPrev,
    search,
    nextStep,
    prevStep,
    play,
    stopPlaying,
    resetSearch,
    newWord,
    setNewWord,
    addWord,
    removeWord,
    loadSampleWords,
  } = useTrie();

  const { playTraverseTone, playMatchTone, playNotFoundTone, setEnabled: setSoundEnabled } = useTrieSound();
  const [soundEnabled, setSoundEnabledState] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
  };

  // Play audio on step changes
  const prevStepRef = useRef(stepIndex);
  useEffect(() => {
    if (stepIndex < 0 || stepIndex === prevStepRef.current) {
      prevStepRef.current = stepIndex;
      return;
    }
    prevStepRef.current = stepIndex;
    const step = steps[stepIndex];
    if (!step) return;
    if (step.action === 'visit') {
      playTraverseTone(step.char ? step.char.charCodeAt(0) % 8 : 0);
    } else if (step.action === 'match' || step.action === 'prefix-match') {
      playMatchTone();
    } else if (step.action === 'not-found') {
      playNotFoundTone();
    }
  }, [stepIndex, steps, playTraverseTone, playMatchTone, playNotFoundTone]);

  // Auto-play logic
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (!canGoNext) {
      stopPlaying();
      return;
    }
    timerRef.current = setTimeout(() => {
      nextStep();
    }, speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIndex, canGoNext, speed, nextStep, stopPlaying]);

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      <TrieControls
        words={words}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        query={query}
        setQuery={setQuery}
        steps={steps}
        stepIndex={stepIndex}
        searchResults={searchResults}
        isPlaying={isPlaying}
        speed={speed}
        setSpeed={setSpeed}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onSearch={search}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onPlay={play}
        onStop={stopPlaying}
        onReset={resetSearch}
        newWord={newWord}
        setNewWord={setNewWord}
        onAddWord={addWord}
        onRemoveWord={removeWord}
        onLoadSample={loadSampleWords}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      <div className="order-last md:order-first flex md:flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] md:min-h-0 max-h-[50vh] md:max-h-none overflow-auto">
        <TrieCanvas
          layout={layout}
          matchedNodeIds={matchedNodeIds}
          currentStepNodeId={currentStepNodeId}
        />
      </div>
    </div>
  );
}
