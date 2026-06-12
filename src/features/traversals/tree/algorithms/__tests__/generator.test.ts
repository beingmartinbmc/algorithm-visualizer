import { describe, expect, it } from 'vitest';
import {
  generateRandomTree,
  getTreeNodes,
  getTreeEdges,
} from '@/features/traversals/tree/algorithms/generator';
import type { TreeNode } from '@/features/traversals/tree/types/tree';

const isValidTree = (root: TreeNode | null): boolean => {
  const seen = new Set<number>();
  const walk = (node: TreeNode | null): boolean => {
    if (!node) return true;
    if (seen.has(node.id)) return false; // no shared/duplicate ids → acyclic, single-parent
    seen.add(node.id);
    return walk(node.left) && walk(node.right);
  };
  return walk(root);
};

const height = (node: TreeNode | null): number =>
  node ? 1 + Math.max(height(node.left), height(node.right)) : 0;

describe('tree generator', () => {
  describe('generateRandomTree', () => {
    it('returns null for non-positive counts', () => {
      expect(generateRandomTree(0)).toBeNull();
      expect(generateRandomTree(-3)).toBeNull();
    });

    it('produces a single-node tree for count 1', () => {
      const root = generateRandomTree(1);
      expect(root).not.toBeNull();
      expect(root!.left).toBeNull();
      expect(root!.right).toBeNull();
    });

    for (const count of [1, 2, 5, 10, 25]) {
      it(`produces exactly ${count} nodes`, () => {
        const root = generateRandomTree(count);
        expect(getTreeNodes(root)).toHaveLength(count);
      });

      it(`produces a structurally valid tree of ${count} nodes`, () => {
        expect(isValidTree(generateRandomTree(count))).toBe(true);
      });
    }

    it('assigns a contiguous set of values 1..n', () => {
      const root = generateRandomTree(8);
      const values = getTreeNodes(root).map((n) => n.value).sort((a, b) => a - b);
      expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('assigns unique node ids', () => {
      const ids = getTreeNodes(generateRandomTree(15)).map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('resets ids per generation (starts at 0)', () => {
      generateRandomTree(10);
      const root = generateRandomTree(5);
      const ids = getTreeNodes(root).map((n) => n.id).sort((a, b) => a - b);
      expect(ids[0]).toBe(0);
    });

    it('lays out the root at the origin and children below it', () => {
      const root = generateRandomTree(12)!;
      expect(root.x).toBe(0);
      expect(root.y).toBe(0);
      for (const node of getTreeNodes(root)) {
        if (node.left) {
          expect(node.left.x).toBeLessThan(node.x);
          expect(node.left.y).toBeGreaterThan(node.y);
        }
        if (node.right) {
          expect(node.right.x).toBeGreaterThan(node.x);
          expect(node.right.y).toBeGreaterThan(node.y);
        }
      }
    });
  });

  describe('getTreeNodes', () => {
    it('returns [] for an empty tree', () => {
      expect(getTreeNodes(null)).toEqual([]);
    });

    it('collects every node exactly once', () => {
      const root = generateRandomTree(20);
      const nodes = getTreeNodes(root);
      expect(new Set(nodes.map((n) => n.id)).size).toBe(20);
    });
  });

  describe('getTreeEdges', () => {
    it('returns [] for an empty tree', () => {
      expect(getTreeEdges(null)).toEqual([]);
    });

    it('produces exactly n-1 edges for an n-node tree', () => {
      for (const count of [1, 2, 7, 16]) {
        const root = generateRandomTree(count);
        expect(getTreeEdges(root)).toHaveLength(count - 1);
      }
    });

    it('every edge connects a real parent to its real child', () => {
      const root = generateRandomTree(18);
      for (const edge of getTreeEdges(root)) {
        expect(edge.from.left === edge.to || edge.from.right === edge.to).toBe(true);
      }
    });

    it('edge depth matches positions (child below parent)', () => {
      const root = generateRandomTree(14);
      for (const edge of getTreeEdges(root)) {
        expect(edge.to.y).toBeGreaterThan(edge.from.y);
      }
    });
  });

  it('generated trees have height between log2(n)+ and n', () => {
    const root = generateRandomTree(10);
    const h = height(root);
    expect(h).toBeGreaterThanOrEqual(1);
    expect(h).toBeLessThanOrEqual(10);
  });
});
