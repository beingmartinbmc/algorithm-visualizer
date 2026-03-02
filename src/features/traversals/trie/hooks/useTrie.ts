import { useState, useCallback, useMemo } from 'react';
import type { TrieNode, SearchMode, TrieStep } from '../types/trie';
import {
  createTrieNode,
  resetNodeCounter,
  insertWord,
  searchWord,
  searchPrefix,
  layoutTrie,
  SAMPLE_WORDS,
} from '../engine/trieEngine';
import type { LayoutNode } from '../engine/trieEngine';

function buildTrie(words: string[]): TrieNode {
  resetNodeCounter();
  const root = createTrieNode('', 0);
  for (const w of words) {
    insertWord(root, w);
  }
  return root;
}

export function useTrie() {
  const [words, setWords] = useState<string[]>(SAMPLE_WORDS);
  const [root, setRoot] = useState<TrieNode>(() => buildTrie(SAMPLE_WORDS));
  const [searchMode, setSearchMode] = useState<SearchMode>('prefix');
  const [query, setQuery] = useState('');
  const [steps, setSteps] = useState<TrieStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [matchedNodeIds, setMatchedNodeIds] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(500);
  const [newWord, setNewWord] = useState('');

  const layout: LayoutNode[] = useMemo(() => layoutTrie(root), [root]);

  const currentStepNodeId = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex].nodeId : null;

  const search = useCallback(() => {
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    const { result, steps: newSteps } =
      searchMode === 'word' ? searchWord(root, q) : searchPrefix(root, q);

    setSteps(newSteps);
    setStepIndex(-1);
    setMatchedNodeIds(new Set(result.matchedPath));
    setSearchResults(result.matches);
    setIsPlaying(false);
  }, [query, searchMode, root]);

  const nextStep = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < steps.length - 1) return prev + 1;
      return prev;
    });
  }, [steps]);

  const prevStep = useCallback(() => {
    setStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const play = useCallback(() => {
    if (steps.length === 0) return;
    setIsPlaying(true);
    setStepIndex(0);
  }, [steps]);

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetSearch = useCallback(() => {
    setSteps([]);
    setStepIndex(-1);
    setMatchedNodeIds(new Set());
    setSearchResults([]);
    setIsPlaying(false);
  }, []);

  const addWord = useCallback(() => {
    const w = newWord.trim().toLowerCase();
    if (!w || words.includes(w)) return;
    const updated = [...words, w];
    setWords(updated);
    setRoot(buildTrie(updated));
    setNewWord('');
    resetSearch();
  }, [newWord, words, resetSearch]);

  const removeWord = useCallback((word: string) => {
    const updated = words.filter((w) => w !== word);
    setWords(updated);
    setRoot(buildTrie(updated));
    resetSearch();
  }, [words, resetSearch]);

  const loadSampleWords = useCallback(() => {
    setWords(SAMPLE_WORDS);
    setRoot(buildTrie(SAMPLE_WORDS));
    setNewWord('');
    resetSearch();
  }, [resetSearch]);

  const canGoNext = stepIndex < steps.length - 1;
  const canGoPrev = stepIndex > 0;

  return {
    words,
    root,
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
  };
}
