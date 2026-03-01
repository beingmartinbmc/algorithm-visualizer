import type { TreeNode } from '../types/tree';

let idCounter = 0;

function createNode(value: number): TreeNode {
  return { id: idCounter++, value, left: null, right: null, x: 0, y: 0 };
}

function insertRandom(node: TreeNode | null, value: number): TreeNode {
  if (!node) return createNode(value);
  if (Math.random() < 0.5) {
    node.left = insertRandom(node.left, value);
  } else {
    node.right = insertRandom(node.right, value);
  }
  return node;
}

export function generateRandomTree(nodeCount: number): TreeNode | null {
  idCounter = 0;
  if (nodeCount <= 0) return null;

  const values = Array.from({ length: nodeCount }, (_, i) => i + 1);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  let root: TreeNode | null = null;
  for (const v of values) {
    if (!root) {
      root = createNode(v);
    } else {
      root = insertRandom(root, v);
    }
  }

  if (root) assignPositions(root, 0, 0, 300);
  return root;
}

function assignPositions(node: TreeNode | null, depth: number, x: number, spread: number) {
  if (!node) return;
  node.x = x;
  node.y = depth * 70;
  assignPositions(node.left, depth + 1, x - spread, spread * 0.55);
  assignPositions(node.right, depth + 1, x + spread, spread * 0.55);
}

export function getTreeNodes(root: TreeNode | null): TreeNode[] {
  const nodes: TreeNode[] = [];
  function collect(node: TreeNode | null) {
    if (!node) return;
    nodes.push(node);
    collect(node.left);
    collect(node.right);
  }
  collect(root);
  return nodes;
}

export interface TreeEdge {
  from: TreeNode;
  to: TreeNode;
}

export function getTreeEdges(root: TreeNode | null): TreeEdge[] {
  const edges: TreeEdge[] = [];
  function collect(node: TreeNode | null) {
    if (!node) return;
    if (node.left) { edges.push({ from: node, to: node.left }); collect(node.left); }
    if (node.right) { edges.push({ from: node, to: node.right }); collect(node.right); }
  }
  collect(root);
  return edges;
}
