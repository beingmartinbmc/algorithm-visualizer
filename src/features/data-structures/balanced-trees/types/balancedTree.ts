export type TreeType = 'bst' | 'avl' | 'rbtree';

export type RBColor = 'red' | 'black';

export interface BTreeNode {
  id: number;
  value: number;
  left: BTreeNode | null;
  right: BTreeNode | null;
  parent: BTreeNode | null;
  height: number;
  color: RBColor;
  x: number;
  y: number;
}

export type OperationType = 'insert' | 'delete';

export interface TreeStep {
  description: string;
  highlightIds: number[];
  snapshotValues: number[];
  snapshotRoot: BTreeNode | null;
}

export const TREE_TYPE_INFO: Record<TreeType, { name: string; description: string; properties: string[] }> = {
  bst: {
    name: 'Binary Search Tree',
    description: 'A binary tree where left child < parent < right child. No self-balancing — can degenerate to a linked list.',
    properties: ['Unbalanced', 'O(h) operations', 'Simple'],
  },
  avl: {
    name: 'AVL Tree',
    description: 'A self-balancing BST where the heights of left and right subtrees differ by at most 1. Uses rotations to maintain balance.',
    properties: ['Height-balanced', 'O(log n)', 'Rotations'],
  },
  rbtree: {
    name: 'Red-Black Tree',
    description: 'A self-balancing BST using node coloring (red/black) and rules to ensure the tree stays approximately balanced.',
    properties: ['Color-balanced', 'O(log n)', 'Recoloring'],
  },
};
