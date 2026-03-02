import type { TrieNode, SearchResult, TrieStep } from '../types/trie';

let nodeCounter = 0;

export function createTrieNode(char: string, depth: number): TrieNode {
  return {
    id: `node-${nodeCounter++}`,
    char,
    children: new Map(),
    isEndOfWord: false,
    depth,
  };
}

export function resetNodeCounter(): void {
  nodeCounter = 0;
}

export function insertWord(root: TrieNode, word: string): void {
  let current = root;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i].toLowerCase();
    if (!current.children.has(ch)) {
      current.children.set(ch, createTrieNode(ch, i + 1));
    }
    current = current.children.get(ch)!;
  }
  current.isEndOfWord = true;
}

export function searchWord(root: TrieNode, word: string): { result: SearchResult; steps: TrieStep[] } {
  const steps: TrieStep[] = [];
  const matchedPath: string[] = [root.id];
  let current = root;

  steps.push({
    nodeId: root.id,
    char: '',
    action: 'visit',
    description: `Start at root`,
  });

  for (let i = 0; i < word.length; i++) {
    const ch = word[i].toLowerCase();
    if (!current.children.has(ch)) {
      steps.push({
        nodeId: current.id,
        char: ch,
        action: 'not-found',
        description: `Character '${ch}' not found — word "${word}" does not exist`,
      });
      return {
        result: { found: false, matchedPath, matches: [] },
        steps,
      };
    }
    current = current.children.get(ch)!;
    matchedPath.push(current.id);
    steps.push({
      nodeId: current.id,
      char: ch,
      action: 'visit',
      description: `Traverse to '${ch}' (depth ${current.depth})`,
    });
  }

  if (current.isEndOfWord) {
    steps.push({
      nodeId: current.id,
      char: '',
      action: 'match',
      description: `"${word}" is a complete word in the trie`,
    });
    return {
      result: { found: true, matchedPath, matches: [word] },
      steps,
    };
  }

  steps.push({
    nodeId: current.id,
    char: '',
    action: 'not-found',
    description: `"${word}" exists as a prefix but is not a complete word`,
  });
  return {
    result: { found: false, matchedPath, matches: [] },
    steps,
  };
}

function collectWords(node: TrieNode, prefix: string, results: string[]): void {
  if (node.isEndOfWord) {
    results.push(prefix);
  }
  for (const [ch, child] of node.children) {
    collectWords(child, prefix + ch, results);
  }
}

export function searchPrefix(root: TrieNode, prefix: string): { result: SearchResult; steps: TrieStep[] } {
  const steps: TrieStep[] = [];
  const matchedPath: string[] = [root.id];
  let current = root;

  steps.push({
    nodeId: root.id,
    char: '',
    action: 'visit',
    description: `Start at root`,
  });

  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i].toLowerCase();
    if (!current.children.has(ch)) {
      steps.push({
        nodeId: current.id,
        char: ch,
        action: 'not-found',
        description: `Character '${ch}' not found — no words with prefix "${prefix}"`,
      });
      return {
        result: { found: false, matchedPath, matches: [] },
        steps,
      };
    }
    current = current.children.get(ch)!;
    matchedPath.push(current.id);
    steps.push({
      nodeId: current.id,
      char: ch,
      action: 'visit',
      description: `Traverse to '${ch}' (depth ${current.depth})`,
    });
  }

  const matches: string[] = [];
  collectWords(current, prefix, matches);

  steps.push({
    nodeId: current.id,
    char: '',
    action: 'prefix-match',
    description: `Found ${matches.length} word(s) with prefix "${prefix}"`,
  });

  return {
    result: { found: true, matchedPath, matches },
    steps,
  };
}

export interface LayoutNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  x: number;
  y: number;
  parentId: string | null;
  depth: number;
}

export function layoutTrie(root: TrieNode): LayoutNode[] {
  const nodes: LayoutNode[] = [];
  const Y_SPACING = 70;
  let xCounter = 0;
  const X_SPACING = 50;

  function dfs(node: TrieNode, parentId: string | null): void {
    if (node.children.size === 0) {
      nodes.push({
        id: node.id,
        char: node.char,
        isEndOfWord: node.isEndOfWord,
        x: xCounter * X_SPACING,
        y: node.depth * Y_SPACING,
        parentId,
        depth: node.depth,
      });
      xCounter++;
      return;
    }

    const childPositions: number[] = [];
    const sortedChildren = [...node.children.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [, child] of sortedChildren) {
      const startX = xCounter;
      dfs(child, node.id);
      childPositions.push((startX + xCounter - 1) / 2);
    }

    const x = childPositions.reduce((a, b) => a + b, 0) / childPositions.length;

    nodes.push({
      id: node.id,
      char: node.char,
      isEndOfWord: node.isEndOfWord,
      x: x * X_SPACING,
      y: node.depth * Y_SPACING,
      parentId,
      depth: node.depth,
    });
  }

  dfs(root, null);
  return nodes;
}

export const SAMPLE_WORDS = [
  'apple', 'app', 'ape', 'apply', 'bat', 'ball', 'ban',
  'cat', 'car', 'card', 'care', 'dog', 'do', 'dot',
];
