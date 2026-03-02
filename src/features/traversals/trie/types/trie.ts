export interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  depth: number;
}

export type SearchMode = 'prefix' | 'word';

export interface SearchResult {
  found: boolean;
  matchedPath: string[];   // node IDs that were traversed
  matches: string[];       // matching words (for prefix search)
}

export interface TrieStep {
  nodeId: string;
  char: string;
  action: 'visit' | 'match' | 'not-found' | 'prefix-match';
  description: string;
}
