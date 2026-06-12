import { describe, expect, it } from 'vitest';
import { runTraversal } from '@/features/traversals/tree/algorithms/traversals';
import type { TraversalStep, TreeNode } from '@/features/traversals/tree/types/tree';

function node(id: number, value: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { id, value, left, right, x: 0, y: 0 };
}

//          4(1)
//        /      \
//      2(2)      6(3)
//     /   \     /   \
//   1(4) 3(5) 5(6)  7(7)
const balancedTree = node(
  1, 4,
  node(2, 2, node(4, 1), node(5, 3)),
  node(3, 6, node(6, 5), node(7, 7)),
);

const processedOrder = (steps: TraversalStep[]) =>
  steps.filter((s) => s.action === 'process').map((s) => s.nodeId);

describe('tree traversals', () => {
  it('returns no steps for an empty tree', () => {
    expect(runTraversal(null, 'inorder')).toEqual([]);
    expect(runTraversal(null, 'levelorder')).toEqual([]);
  });

  it('in-order: Left → Root → Right (sorted ids by value here)', () => {
    expect(processedOrder(runTraversal(balancedTree, 'inorder'))).toEqual([4, 2, 5, 1, 6, 3, 7]);
  });

  it('pre-order: Root → Left → Right', () => {
    expect(processedOrder(runTraversal(balancedTree, 'preorder'))).toEqual([1, 2, 4, 5, 3, 6, 7]);
  });

  it('post-order: Left → Right → Root', () => {
    expect(processedOrder(runTraversal(balancedTree, 'postorder'))).toEqual([4, 5, 2, 6, 7, 3, 1]);
  });

  it('level-order: top to bottom, left to right', () => {
    expect(processedOrder(runTraversal(balancedTree, 'levelorder'))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('every node is visited and processed exactly once', () => {
    for (const type of ['inorder', 'preorder', 'postorder', 'levelorder'] as const) {
      const steps = runTraversal(balancedTree, type);
      expect(steps.filter((s) => s.action === 'visit')).toHaveLength(7);
      expect(steps.filter((s) => s.action === 'process')).toHaveLength(7);
    }
  });

  it('handles a degenerate (right-skewed) tree', () => {
    const skewed = node(1, 1, null, node(2, 2, null, node(3, 3)));
    expect(processedOrder(runTraversal(skewed, 'inorder'))).toEqual([1, 2, 3]);
    expect(processedOrder(runTraversal(skewed, 'preorder'))).toEqual([1, 2, 3]);
    expect(processedOrder(runTraversal(skewed, 'postorder'))).toEqual([3, 2, 1]);
  });
});
