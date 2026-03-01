import type { TreeNode, TraversalStep, TraversalType } from '../types/tree';

function inorder(node: TreeNode | null, steps: TraversalStep[]) {
  if (!node) return;
  steps.push({ nodeId: node.id, action: 'visit' });
  inorder(node.left, steps);
  steps.push({ nodeId: node.id, action: 'process' });
  inorder(node.right, steps);
}

function preorder(node: TreeNode | null, steps: TraversalStep[]) {
  if (!node) return;
  steps.push({ nodeId: node.id, action: 'visit' });
  steps.push({ nodeId: node.id, action: 'process' });
  preorder(node.left, steps);
  preorder(node.right, steps);
}

function postorder(node: TreeNode | null, steps: TraversalStep[]) {
  if (!node) return;
  steps.push({ nodeId: node.id, action: 'visit' });
  postorder(node.left, steps);
  postorder(node.right, steps);
  steps.push({ nodeId: node.id, action: 'process' });
}

function levelorder(root: TreeNode | null, steps: TraversalStep[]) {
  if (!root) return;
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    steps.push({ nodeId: node.id, action: 'visit' });
    steps.push({ nodeId: node.id, action: 'process' });
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}

export function runTraversal(root: TreeNode | null, type: TraversalType): TraversalStep[] {
  const steps: TraversalStep[] = [];
  switch (type) {
    case 'inorder': inorder(root, steps); break;
    case 'preorder': preorder(root, steps); break;
    case 'postorder': postorder(root, steps); break;
    case 'levelorder': levelorder(root, steps); break;
  }
  return steps;
}
