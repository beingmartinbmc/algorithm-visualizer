import type { BTreeNode, TreeStep } from '../types/balancedTree';

let idCounter = 0;

function newNode(value: number): BTreeNode {
  return { id: idCounter++, value, left: null, right: null, parent: null, height: 1, color: 'black', x: 0, y: 0 };
}

function height(node: BTreeNode | null): number {
  return node ? node.height : 0;
}

function updateHeight(node: BTreeNode) {
  node.height = 1 + Math.max(height(node.left), height(node.right));
}

function balanceFactor(node: BTreeNode): number {
  return height(node.left) - height(node.right);
}

function rotateRight(y: BTreeNode, steps: TreeStep[], root: BTreeNode | null): BTreeNode {
  const x = y.left!;
  steps.push({ description: `Right rotate at ${y.value}`, highlightIds: [y.id, x.id], snapshotValues: [], snapshotRoot: null });
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: BTreeNode, steps: TreeStep[], root: BTreeNode | null): BTreeNode {
  const y = x.right!;
  steps.push({ description: `Left rotate at ${x.value}`, highlightIds: [x.id, y.id], snapshotValues: [], snapshotRoot: null });
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function assignPositions(node: BTreeNode | null, depth: number, x: number, spread: number) {
  if (!node) return;
  node.x = x;
  node.y = depth * 70;
  assignPositions(node.left, depth + 1, x - spread, spread * 0.55);
  assignPositions(node.right, depth + 1, x + spread, spread * 0.55);
}

function cloneTree(node: BTreeNode | null): BTreeNode | null {
  if (!node) return null;
  const n: BTreeNode = { ...node, parent: null, left: null, right: null };
  n.left = cloneTree(node.left);
  n.right = cloneTree(node.right);
  return n;
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

function maxId(node: BTreeNode | null): number {
  if (!node) return -1;
  return Math.max(node.id, maxId(node.left), maxId(node.right));
}

function findMin(node: BTreeNode): BTreeNode {
  while (node.left) node = node.left;
  return node;
}

function balance(node: BTreeNode, steps: TreeStep[], root: BTreeNode | null): BTreeNode {
  updateHeight(node);
  const bf = balanceFactor(node);

  if (bf > 1) {
    if (balanceFactor(node.left!) < 0) {
      node.left = rotateLeft(node.left!, steps, root);
    }
    return rotateRight(node, steps, root);
  }
  if (bf < -1) {
    if (balanceFactor(node.right!) > 0) {
      node.right = rotateRight(node.right!, steps, root);
    }
    return rotateLeft(node, steps, root);
  }
  return node;
}

export function avlInsert(root: BTreeNode | null, value: number): { root: BTreeNode; steps: TreeStep[] } {
  idCounter = root ? maxId(root) + 1 : 0;
  const steps: TreeStep[] = [];

  function insert(node: BTreeNode | null): BTreeNode {
    if (!node) {
      const n = newNode(value);
      steps.push({ description: `Insert ${value}`, highlightIds: [n.id], snapshotValues: [], snapshotRoot: null });
      return n;
    }

    steps.push({ description: `Compare ${value} with ${node.value}`, highlightIds: [node.id], snapshotValues: [], snapshotRoot: null });

    if (value < node.value) {
      node.left = insert(node.left);
    } else if (value > node.value) {
      node.right = insert(node.right);
    } else {
      return node;
    }

    return balance(node, steps, root);
  }

  const newRoot = insert(root ? cloneTree(root) : null)!;
  assignPositions(newRoot, 0, 0, 300);

  steps.forEach((s) => { s.snapshotRoot = snapshot(newRoot); s.snapshotValues = collectValues(newRoot); });
  steps.push({ description: `Inserted ${value} — balanced`, highlightIds: [], snapshotValues: collectValues(newRoot), snapshotRoot: snapshot(newRoot) });

  return { root: newRoot, steps };
}

export function avlDelete(root: BTreeNode | null, value: number): { root: BTreeNode | null; steps: TreeStep[] } {
  if (!root) return { root: null, steps: [{ description: 'Tree is empty', highlightIds: [], snapshotValues: [], snapshotRoot: null }] };

  idCounter = maxId(root) + 1;
  const steps: TreeStep[] = [];

  function remove(node: BTreeNode | null): BTreeNode | null {
    if (!node) {
      steps.push({ description: `${value} not found`, highlightIds: [], snapshotValues: [], snapshotRoot: null });
      return null;
    }

    steps.push({ description: `Compare ${value} with ${node.value}`, highlightIds: [node.id], snapshotValues: [], snapshotRoot: null });

    if (value < node.value) {
      node.left = remove(node.left);
    } else if (value > node.value) {
      node.right = remove(node.right);
    } else {
      steps.push({ description: `Found ${value}, removing`, highlightIds: [node.id], snapshotValues: [], snapshotRoot: null });
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const successor = findMin(node.right);
      steps.push({ description: `Replace with successor ${successor.value}`, highlightIds: [successor.id], snapshotValues: [], snapshotRoot: null });
      node.value = successor.value;
      node.right = remove(node.right);
    }

    if (!node) return null;
    return balance(node, steps, root);
  }

  const newRoot = remove(cloneTree(root));
  if (newRoot) assignPositions(newRoot, 0, 0, 300);

  steps.forEach((s) => { s.snapshotRoot = snapshot(newRoot); s.snapshotValues = collectValues(newRoot); });
  steps.push({ description: `Deleted ${value} — balanced`, highlightIds: [], snapshotValues: collectValues(newRoot), snapshotRoot: snapshot(newRoot) });

  return { root: newRoot, steps };
}

export function createAVLFromValues(values: number[]): BTreeNode | null {
  let root: BTreeNode | null = null;
  for (const v of values) {
    const result = avlInsert(root, v);
    root = result.root;
  }
  return root;
}
