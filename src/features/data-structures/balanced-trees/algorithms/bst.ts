import type { BTreeNode, TreeStep } from '../types/balancedTree';

let idCounter = 0;

function newNode(value: number, parent: BTreeNode | null): BTreeNode {
  return {
    id: idCounter++,
    value,
    left: null,
    right: null,
    parent,
    height: 1,
    color: 'black',
    x: 0,
    y: 0,
  };
}

function cloneTree(node: BTreeNode | null, parent: BTreeNode | null = null): BTreeNode | null {
  if (!node) return null;
  const n: BTreeNode = { ...node, parent, left: null, right: null };
  n.left = cloneTree(node.left, n);
  n.right = cloneTree(node.right, n);
  return n;
}

function assignPositions(node: BTreeNode | null, depth: number, x: number, spread: number) {
  if (!node) return;
  node.x = x;
  node.y = depth * 70;
  assignPositions(node.left, depth + 1, x - spread, spread * 0.55);
  assignPositions(node.right, depth + 1, x + spread, spread * 0.55);
}

function snapshot(root: BTreeNode | null): BTreeNode | null {
  const c = cloneTree(root);
  if (c) assignPositions(c, 0, 0, 300);
  return c;
}

function collectValues(node: BTreeNode | null): number[] {
  if (!node) return [];
  return [...collectValues(node.left), node.value, ...collectValues(node.right)];
}

function findMin(node: BTreeNode): BTreeNode {
  while (node.left) node = node.left;
  return node;
}

export function bstInsert(root: BTreeNode | null, value: number): { root: BTreeNode; steps: TreeStep[] } {
  idCounter = root ? maxId(root) + 1 : 0;
  const steps: TreeStep[] = [];

  function insert(node: BTreeNode | null, parent: BTreeNode | null): BTreeNode {
    if (!node) {
      const n = newNode(value, parent);
      steps.push({
        description: `Insert ${value}`,
        highlightIds: [n.id],
        snapshotValues: collectValues(root),
        snapshotRoot: null,
      });
      return n;
    }

    steps.push({
      description: `Compare ${value} with ${node.value}`,
      highlightIds: [node.id],
      snapshotValues: collectValues(root),
      snapshotRoot: null,
    });

    if (value < node.value) {
      node.left = insert(node.left, node);
    } else if (value > node.value) {
      node.right = insert(node.right, node);
    }
    return node;
  }

  const newRoot = insert(root ? cloneTree(root) : null, null);
  if (newRoot) assignPositions(newRoot, 0, 0, 300);

  steps.forEach((s) => {
    s.snapshotRoot = snapshot(newRoot);
  });

  steps.push({
    description: `Inserted ${value} — done`,
    highlightIds: [],
    snapshotValues: collectValues(newRoot),
    snapshotRoot: snapshot(newRoot),
  });

  return { root: newRoot, steps };
}

export function bstDelete(root: BTreeNode | null, value: number): { root: BTreeNode | null; steps: TreeStep[] } {
  if (!root) return { root: null, steps: [{ description: `Tree is empty`, highlightIds: [], snapshotValues: [], snapshotRoot: null }] };

  idCounter = maxId(root) + 1;
  const steps: TreeStep[] = [];
  let workRoot = cloneTree(root)!;

  function remove(node: BTreeNode | null): BTreeNode | null {
    if (!node) {
      steps.push({ description: `${value} not found`, highlightIds: [], snapshotValues: collectValues(workRoot), snapshotRoot: null });
      return null;
    }

    steps.push({ description: `Compare ${value} with ${node.value}`, highlightIds: [node.id], snapshotValues: collectValues(workRoot), snapshotRoot: null });

    if (value < node.value) {
      node.left = remove(node.left);
    } else if (value > node.value) {
      node.right = remove(node.right);
    } else {
      steps.push({ description: `Found ${value}, removing`, highlightIds: [node.id], snapshotValues: collectValues(workRoot), snapshotRoot: null });

      if (!node.left) return node.right;
      if (!node.right) return node.left;

      const successor = findMin(node.right);
      steps.push({ description: `Replace with successor ${successor.value}`, highlightIds: [successor.id], snapshotValues: collectValues(workRoot), snapshotRoot: null });
      node.value = successor.value;
      node.right = remove(node.right);
    }
    return node;
  }

  workRoot = remove(workRoot) as BTreeNode;
  if (workRoot) assignPositions(workRoot, 0, 0, 300);

  steps.forEach((s) => {
    s.snapshotRoot = snapshot(workRoot);
  });

  steps.push({
    description: `Deleted ${value} — done`,
    highlightIds: [],
    snapshotValues: collectValues(workRoot),
    snapshotRoot: snapshot(workRoot),
  });

  return { root: workRoot, steps };
}

function maxId(node: BTreeNode | null): number {
  if (!node) return -1;
  return Math.max(node.id, maxId(node.left), maxId(node.right));
}

export function createBSTFromValues(values: number[]): BTreeNode | null {
  idCounter = 0;
  let root: BTreeNode | null = null;
  for (const v of values) {
    root = bstInsertSilent(root, v);
  }
  if (root) assignPositions(root, 0, 0, 300);
  return root;
}

function bstInsertSilent(node: BTreeNode | null, value: number): BTreeNode {
  if (!node) return newNode(value, null);
  if (value < node.value) { node.left = bstInsertSilent(node.left, value); node.left.parent = node; }
  else if (value > node.value) { node.right = bstInsertSilent(node.right, value); node.right.parent = node; }
  return node;
}
