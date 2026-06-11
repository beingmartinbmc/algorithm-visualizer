import type { BTreeNode, TreeStep, RBColor } from '../types/balancedTree';

let idCounter = 0;

function newNode(value: number, color: RBColor): BTreeNode {
  return { id: idCounter++, value, left: null, right: null, parent: null, height: 1, color, x: 0, y: 0 };
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

function maxId(node: BTreeNode | null): number {
  if (!node) return -1;
  return Math.max(node.id, maxId(node.left), maxId(node.right));
}

function colorOf(node: BTreeNode | null): RBColor {
  return node ? node.color : 'black';
}

interface RootRef {
  current: BTreeNode | null;
}

/** Snapshot the working tree at the moment a step occurs (mid-operation). */
function pushSnapshot(steps: TreeStep[], description: string, highlightIds: number[], rootRef: RootRef) {
  const snap = snapshot(rootRef.current);
  steps.push({
    description,
    highlightIds,
    snapshotValues: collectValues(snap),
    snapshotRoot: snap,
  });
}

function rotateLeft(root: BTreeNode, x: BTreeNode): BTreeNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root: BTreeNode, x: BTreeNode): BTreeNode {
  const y = x.left!;
  x.left = y.right;
  if (y.right) y.right.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.right) x.parent.right = y;
  else x.parent.left = y;
  y.right = x;
  x.parent = y;
  return root;
}

function fixInsert(rootRef: RootRef, node: BTreeNode, steps: TreeStep[]): BTreeNode {
  let root = rootRef.current!;
  let z = node;
  while (z.parent && z.parent.color === 'red') {
    const gp = z.parent.parent;
    if (!gp) break;

    if (z.parent === gp.left) {
      const uncle = gp.right;
      if (colorOf(uncle) === 'red') {
        z.parent.color = 'black';
        uncle!.color = 'black';
        gp.color = 'red';
        rootRef.current = root;
        pushSnapshot(steps, `Recolor: parent ${z.parent.value} & uncle ${uncle!.value} → black, grandparent ${gp.value} → red`, [z.parent.id, uncle!.id, gp.id], rootRef);
        z = gp;
      } else {
        if (z === z.parent.right) {
          z = z.parent;
          root = rotateLeft(root, z);
          rootRef.current = root;
          pushSnapshot(steps, `Left rotate at ${z.value}`, [z.id], rootRef);
        }
        z.parent!.color = 'black';
        gp.color = 'red';
        root = rotateRight(root, gp);
        rootRef.current = root;
        pushSnapshot(steps, `Right rotate at ${gp.value}`, [gp.id], rootRef);
      }
    } else {
      const uncle = gp.left;
      if (colorOf(uncle) === 'red') {
        z.parent.color = 'black';
        uncle!.color = 'black';
        gp.color = 'red';
        rootRef.current = root;
        pushSnapshot(steps, `Recolor: parent ${z.parent.value} & uncle ${uncle!.value} → black, grandparent ${gp.value} → red`, [z.parent.id, uncle!.id, gp.id], rootRef);
        z = gp;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          root = rotateRight(root, z);
          rootRef.current = root;
          pushSnapshot(steps, `Right rotate at ${z.value}`, [z.id], rootRef);
        }
        z.parent!.color = 'black';
        gp.color = 'red';
        root = rotateLeft(root, gp);
        rootRef.current = root;
        pushSnapshot(steps, `Left rotate at ${gp.value}`, [gp.id], rootRef);
      }
    }
  }
  root.color = 'black';
  rootRef.current = root;
  return root;
}

export function rbInsert(root: BTreeNode | null, value: number): { root: BTreeNode; steps: TreeStep[] } {
  idCounter = root ? maxId(root) + 1 : 0;
  const steps: TreeStep[] = [];
  const rootRef: RootRef = { current: root ? cloneTree(root) : null };

  const node = newNode(value, 'red');

  if (!rootRef.current) {
    node.color = 'black';
    rootRef.current = node;
    assignPositions(node, 0, 0, 300);
    pushSnapshot(steps, `Insert ${value} (red)`, [node.id], rootRef);
    pushSnapshot(steps, `${value} is root — color black`, [node.id], rootRef);
    return { root: node, steps };
  }

  pushSnapshot(steps, `Insert ${value} (red)`, [node.id], rootRef);

  let current: BTreeNode | null = rootRef.current;
  let parent: BTreeNode | null = null;
  while (current) {
    parent = current;
    pushSnapshot(steps, `Compare ${value} with ${current.value}`, [current.id], rootRef);
    if (value < current.value) current = current.left;
    else if (value > current.value) current = current.right;
    else {
      assignPositions(rootRef.current, 0, 0, 300);
      pushSnapshot(steps, `${value} already exists`, [], rootRef);
      return { root: rootRef.current, steps };
    }
  }

  node.parent = parent;
  if (value < parent!.value) parent!.left = node;
  else parent!.right = node;

  const newRoot = fixInsert(rootRef, node, steps);
  assignPositions(newRoot, 0, 0, 300);
  rootRef.current = newRoot;

  pushSnapshot(steps, `Inserted ${value} — RB properties restored`, [], rootRef);

  return { root: newRoot, steps };
}

export function rbDelete(root: BTreeNode | null, value: number): { root: BTreeNode | null; steps: TreeStep[] } {
  if (!root) return { root: null, steps: [{ description: 'Tree is empty', highlightIds: [], snapshotValues: [], snapshotRoot: null }] };

  idCounter = maxId(root) + 1;
  const steps: TreeStep[] = [];
  const rootRef: RootRef = { current: cloneTree(root) };

  function findNode(node: BTreeNode | null, val: number): BTreeNode | null {
    if (!node) return null;
    if (val < node.value) return findNode(node.left, val);
    if (val > node.value) return findNode(node.right, val);
    return node;
  }

  const target = findNode(rootRef.current, value);
  if (!target) {
    pushSnapshot(steps, `${value} not found`, [], rootRef);
    return { root: rootRef.current, steps };
  }

  pushSnapshot(steps, `Found ${value}, deleting`, [target.id], rootRef);

  let nodeToRemove = target;
  if (target.left && target.right) {
    let successor = target.right;
    while (successor.left) successor = successor.left;
    target.value = successor.value;
    nodeToRemove = successor;
    pushSnapshot(steps, `Replace with successor ${successor.value}`, [successor.id], rootRef);
  }

  const child = nodeToRemove.left || nodeToRemove.right;
  if (child) child.parent = nodeToRemove.parent;

  if (!nodeToRemove.parent) {
    rootRef.current = child as BTreeNode | null;
  } else if (nodeToRemove === nodeToRemove.parent.left) {
    nodeToRemove.parent.left = child;
  } else {
    nodeToRemove.parent.right = child;
  }

  if (rootRef.current) {
    rootRef.current.color = 'black';
    assignPositions(rootRef.current, 0, 0, 300);
  }

  pushSnapshot(steps, `Deleted ${value} — done`, [], rootRef);

  return { root: rootRef.current, steps };
}

export function createRBFromValues(values: number[]): BTreeNode | null {
  let root: BTreeNode | null = null;
  for (const v of values) {
    const result = rbInsert(root, v);
    root = result.root;
  }
  return root;
}
