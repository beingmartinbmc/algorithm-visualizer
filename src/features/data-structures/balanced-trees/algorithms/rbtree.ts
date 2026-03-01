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

function fixInsert(root: BTreeNode, node: BTreeNode, steps: TreeStep[]): BTreeNode {
  let z = node;
  while (z.parent && z.parent.color === 'red') {
    const gp = z.parent.parent;
    if (!gp) break;

    if (z.parent === gp.left) {
      const uncle = gp.right;
      if (colorOf(uncle) === 'red') {
        steps.push({ description: `Recolor: parent ${z.parent.value} & uncle ${uncle!.value} → black, grandparent ${gp.value} → red`, highlightIds: [z.parent.id, uncle!.id, gp.id], snapshotValues: [], snapshotRoot: null });
        z.parent.color = 'black';
        uncle!.color = 'black';
        gp.color = 'red';
        z = gp;
      } else {
        if (z === z.parent.right) {
          z = z.parent;
          steps.push({ description: `Left rotate at ${z.value}`, highlightIds: [z.id], snapshotValues: [], snapshotRoot: null });
          root = rotateLeft(root, z);
        }
        z.parent!.color = 'black';
        gp.color = 'red';
        steps.push({ description: `Right rotate at ${gp.value}`, highlightIds: [gp.id], snapshotValues: [], snapshotRoot: null });
        root = rotateRight(root, gp);
      }
    } else {
      const uncle = gp.left;
      if (colorOf(uncle) === 'red') {
        steps.push({ description: `Recolor: parent ${z.parent.value} & uncle ${uncle!.value} → black, grandparent ${gp.value} → red`, highlightIds: [z.parent.id, uncle!.id, gp.id], snapshotValues: [], snapshotRoot: null });
        z.parent.color = 'black';
        uncle!.color = 'black';
        gp.color = 'red';
        z = gp;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          steps.push({ description: `Right rotate at ${z.value}`, highlightIds: [z.id], snapshotValues: [], snapshotRoot: null });
          root = rotateRight(root, z);
        }
        z.parent!.color = 'black';
        gp.color = 'red';
        steps.push({ description: `Left rotate at ${gp.value}`, highlightIds: [gp.id], snapshotValues: [], snapshotRoot: null });
        root = rotateLeft(root, gp);
      }
    }
  }
  root.color = 'black';
  return root;
}

export function rbInsert(root: BTreeNode | null, value: number): { root: BTreeNode; steps: TreeStep[] } {
  idCounter = root ? maxId(root) + 1 : 0;
  const steps: TreeStep[] = [];
  let workRoot = root ? cloneTree(root)! : null;

  const node = newNode(value, 'red');
  steps.push({ description: `Insert ${value} (red)`, highlightIds: [node.id], snapshotValues: [], snapshotRoot: null });

  if (!workRoot) {
    node.color = 'black';
    assignPositions(node, 0, 0, 300);
    steps.forEach((s) => { s.snapshotRoot = snapshot(node); s.snapshotValues = collectValues(node); });
    steps.push({ description: `${value} is root — color black`, highlightIds: [node.id], snapshotValues: collectValues(node), snapshotRoot: snapshot(node) });
    return { root: node, steps };
  }

  let current: BTreeNode | null = workRoot;
  let parent: BTreeNode | null = null;
  while (current) {
    parent = current;
    steps.push({ description: `Compare ${value} with ${current.value}`, highlightIds: [current.id], snapshotValues: [], snapshotRoot: null });
    if (value < current.value) current = current.left;
    else if (value > current.value) current = current.right;
    else {
      assignPositions(workRoot, 0, 0, 300);
      steps.forEach((s) => { s.snapshotRoot = snapshot(workRoot); s.snapshotValues = collectValues(workRoot); });
      steps.push({ description: `${value} already exists`, highlightIds: [], snapshotValues: collectValues(workRoot), snapshotRoot: snapshot(workRoot) });
      return { root: workRoot, steps };
    }
  }

  node.parent = parent;
  if (value < parent!.value) parent!.left = node;
  else parent!.right = node;

  workRoot = fixInsert(workRoot, node, steps);
  assignPositions(workRoot, 0, 0, 300);

  steps.forEach((s) => { s.snapshotRoot = snapshot(workRoot); s.snapshotValues = collectValues(workRoot); });
  steps.push({ description: `Inserted ${value} — RB properties restored`, highlightIds: [], snapshotValues: collectValues(workRoot), snapshotRoot: snapshot(workRoot) });

  return { root: workRoot, steps };
}

export function rbDelete(root: BTreeNode | null, value: number): { root: BTreeNode | null; steps: TreeStep[] } {
  if (!root) return { root: null, steps: [{ description: 'Tree is empty', highlightIds: [], snapshotValues: [], snapshotRoot: null }] };

  idCounter = maxId(root) + 1;
  const steps: TreeStep[] = [];
  let workRoot = cloneTree(root)!;

  function findNode(node: BTreeNode | null, val: number): BTreeNode | null {
    if (!node) return null;
    if (val < node.value) return findNode(node.left, val);
    if (val > node.value) return findNode(node.right, val);
    return node;
  }

  const target = findNode(workRoot, value);
  if (!target) {
    steps.push({ description: `${value} not found`, highlightIds: [], snapshotValues: collectValues(workRoot), snapshotRoot: snapshot(workRoot) });
    return { root: workRoot, steps };
  }

  steps.push({ description: `Found ${value}, deleting`, highlightIds: [target.id], snapshotValues: [], snapshotRoot: null });

  let nodeToRemove = target;
  if (target.left && target.right) {
    let successor = target.right;
    while (successor.left) successor = successor.left;
    steps.push({ description: `Replace with successor ${successor.value}`, highlightIds: [successor.id], snapshotValues: [], snapshotRoot: null });
    target.value = successor.value;
    nodeToRemove = successor;
  }

  const child = nodeToRemove.left || nodeToRemove.right;
  if (child) child.parent = nodeToRemove.parent;

  if (!nodeToRemove.parent) {
    workRoot = child as BTreeNode;
  } else if (nodeToRemove === nodeToRemove.parent.left) {
    nodeToRemove.parent.left = child;
  } else {
    nodeToRemove.parent.right = child;
  }

  if (workRoot) {
    workRoot.color = 'black';
    assignPositions(workRoot, 0, 0, 300);
  }

  steps.forEach((s) => { s.snapshotRoot = snapshot(workRoot); s.snapshotValues = collectValues(workRoot); });
  steps.push({ description: `Deleted ${value} — done`, highlightIds: [], snapshotValues: collectValues(workRoot), snapshotRoot: snapshot(workRoot) });

  return { root: workRoot, steps };
}

export function createRBFromValues(values: number[]): BTreeNode | null {
  let root: BTreeNode | null = null;
  for (const v of values) {
    const result = rbInsert(root, v);
    root = result.root;
  }
  return root;
}
