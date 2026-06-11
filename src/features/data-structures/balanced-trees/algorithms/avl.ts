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

interface RootRef {
  current: BTreeNode | null;
}

/**
 * Push a snapshot of the current tree state onto the steps array.
 * Snapshots are taken at the moment the step occurs so animation can show
 * intermediate trees (mid-rotation) rather than only the final shape.
 */
function pushSnapshot(steps: TreeStep[], description: string, highlightIds: number[], rootRef: RootRef) {
  const snap = snapshot(rootRef.current);
  steps.push({
    description,
    highlightIds,
    snapshotValues: collectValues(snap),
    snapshotRoot: snap,
  });
}

function rotateRight(y: BTreeNode, steps: TreeStep[], rootRef: RootRef): BTreeNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  // If y was the root, x is now the root — keep rootRef in sync before snapshotting.
  if (rootRef.current === y) rootRef.current = x;
  pushSnapshot(steps, `Right rotate at ${y.value}`, [y.id, x.id], rootRef);
  return x;
}

function rotateLeft(x: BTreeNode, steps: TreeStep[], rootRef: RootRef): BTreeNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  if (rootRef.current === x) rootRef.current = y;
  pushSnapshot(steps, `Left rotate at ${x.value}`, [x.id, y.id], rootRef);
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

function balance(node: BTreeNode, steps: TreeStep[], rootRef: RootRef): BTreeNode {
  updateHeight(node);
  const bf = balanceFactor(node);

  if (bf > 1) {
    if (balanceFactor(node.left!) < 0) {
      node.left = rotateLeft(node.left!, steps, rootRef);
    }
    return rotateRight(node, steps, rootRef);
  }
  if (bf < -1) {
    if (balanceFactor(node.right!) > 0) {
      node.right = rotateRight(node.right!, steps, rootRef);
    }
    return rotateLeft(node, steps, rootRef);
  }
  return node;
}

export function avlInsert(root: BTreeNode | null, value: number): { root: BTreeNode; steps: TreeStep[] } {
  idCounter = root ? maxId(root) + 1 : 0;
  const steps: TreeStep[] = [];
  const rootRef: RootRef = { current: root ? cloneTree(root) : null };

  function insert(node: BTreeNode | null): BTreeNode {
    if (!node) {
      const n = newNode(value);
      // Tentatively splice in to keep snapshots accurate; caller will overwrite if needed.
      if (!rootRef.current) rootRef.current = n;
      pushSnapshot(steps, `Insert ${value}`, [n.id], rootRef);
      return n;
    }

    pushSnapshot(steps, `Compare ${value} with ${node.value}`, [node.id], rootRef);

    if (value < node.value) {
      node.left = insert(node.left);
    } else if (value > node.value) {
      node.right = insert(node.right);
    } else {
      return node;
    }

    return balance(node, steps, rootRef);
  }

  const newRoot = insert(rootRef.current)!;
  rootRef.current = newRoot;
  assignPositions(newRoot, 0, 0, 300);

  pushSnapshot(steps, `Inserted ${value} — balanced`, [], rootRef);

  return { root: newRoot, steps };
}

export function avlDelete(root: BTreeNode | null, value: number): { root: BTreeNode | null; steps: TreeStep[] } {
  if (!root) return { root: null, steps: [{ description: 'Tree is empty', highlightIds: [], snapshotValues: [], snapshotRoot: null }] };

  idCounter = maxId(root) + 1;
  const steps: TreeStep[] = [];
  const rootRef: RootRef = { current: cloneTree(root) };

  function remove(node: BTreeNode | null): BTreeNode | null {
    if (!node) {
      pushSnapshot(steps, `${value} not found`, [], rootRef);
      return null;
    }

    pushSnapshot(steps, `Compare ${value} with ${node.value}`, [node.id], rootRef);

    if (value < node.value) {
      node.left = remove(node.left);
    } else if (value > node.value) {
      node.right = remove(node.right);
    } else {
      pushSnapshot(steps, `Found ${value}, removing`, [node.id], rootRef);
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const successor = findMin(node.right);
      pushSnapshot(steps, `Replace with successor ${successor.value}`, [successor.id], rootRef);
      node.value = successor.value;
      node.right = remove(node.right);
    }

    return balance(node, steps, rootRef);
  }

  const newRoot = remove(rootRef.current);
  rootRef.current = newRoot;
  if (newRoot) assignPositions(newRoot, 0, 0, 300);

  pushSnapshot(steps, `Deleted ${value} — balanced`, [], rootRef);

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
