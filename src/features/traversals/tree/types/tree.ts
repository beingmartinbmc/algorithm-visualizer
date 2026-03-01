export interface TreeNode {
  id: number;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
}

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export interface TraversalStep {
  nodeId: number;
  action: 'visit' | 'process';
}

export const TRAVERSAL_INFO: Record<TraversalType, { name: string; description: string; order: string }> = {
  inorder: {
    name: 'In-Order',
    description: 'Visits left subtree, then root, then right subtree. Produces sorted output for BSTs.',
    order: 'Left → Root → Right',
  },
  preorder: {
    name: 'Pre-Order',
    description: 'Visits root first, then left subtree, then right subtree. Useful for copying trees.',
    order: 'Root → Left → Right',
  },
  postorder: {
    name: 'Post-Order',
    description: 'Visits left subtree, then right subtree, then root. Useful for deleting trees.',
    order: 'Left → Right → Root',
  },
  levelorder: {
    name: 'Level-Order',
    description: 'Visits nodes level by level from top to bottom, left to right. Also known as BFS.',
    order: 'Top → Bottom, Left → Right',
  },
};
