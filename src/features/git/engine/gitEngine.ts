import type { GitState, GitCommandResult, GitAction, GitCommit, GitStashEntry } from '../types/git';

let idCounter = 0;
function generateId(): string {
  idCounter++;
  const hex = idCounter.toString(16).padStart(7, '0');
  const suffix = Math.random().toString(16).slice(2, 5);
  return `${hex}${suffix}`.slice(0, 7);
}

export function createInitialState(): GitState {
  return {
    initialized: false,
    commits: {},
    branches: [],
    tags: [],
    head: 'main',
    detachedHead: false,
    workingDirectory: {},
    stagingArea: {},
    stash: [],
    commitOrder: [],
    remotes: [],
    remoteState: { branches: [], commits: {}, commitOrder: [] },
    trackingBranches: {},
  };
}

function cloneState(state: GitState): GitState {
  return JSON.parse(JSON.stringify(state));
}

function getCurrentBranch(state: GitState): string | null {
  if (state.detachedHead) return null;
  return state.head;
}

function getHeadCommitId(state: GitState): string | null {
  if (state.detachedHead) return state.head;
  const branch = state.branches.find(b => b.name === state.head);
  return branch?.commitId ?? null;
}

function getHeadCommit(state: GitState): GitCommit | null {
  const id = getHeadCommitId(state);
  return id ? state.commits[id] ?? null : null;
}

function getCommitAncestors(state: GitState, commitId: string): Set<string> {
  const ancestors = new Set<string>();
  const stack = [commitId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (ancestors.has(id)) continue;
    ancestors.add(id);
    const commit = state.commits[id];
    if (commit) {
      stack.push(...commit.parentIds);
    }
  }
  return ancestors;
}

function isAncestor(state: GitState, possibleAncestor: string, descendant: string): boolean {
  const ancestors = getCommitAncestors(state, descendant);
  return ancestors.has(possibleAncestor);
}

function result(success: boolean, output: string, state: GitState, action?: GitAction): GitCommandResult {
  return { success, output, state, action };
}

function errorResult(msg: string, state: GitState): GitCommandResult {
  return result(false, msg, state, 'error');
}

// ─── git init ──────────────────────────────────────────────────────────────────

function handleInit(state: GitState): GitCommandResult {
  if (state.initialized) {
    return errorResult('Reinitialized existing Git repository', state);
  }
  const s = cloneState(state);
  s.initialized = true;
  s.head = 'main';
  s.branches = [{ name: 'main', commitId: '' }];
  return result(true, 'Initialized empty Git repository', s, 'init');
}

// ─── git add ───────────────────────────────────────────────────────────────────

function handleAdd(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('Nothing specified, nothing added.', state);

  const s = cloneState(state);
  const headCommit = getHeadCommit(s);
  const committedFiles = headCommit?.files ?? {};

  if (args[0] === '.' || args[0] === '-A' || args[0] === '--all') {
    const allFiles = Object.keys(s.workingDirectory);
    if (allFiles.length === 0 && Object.keys(committedFiles).length === 0) {
      return errorResult('nothing to add', s);
    }
    let added = 0;
    for (const file of allFiles) {
      const wdContent = s.workingDirectory[file];
      const committedContent = committedFiles[file];
      if (wdContent !== committedContent || !committedContent) {
        s.stagingArea[file] = wdContent;
        added++;
      }
    }
    for (const file of Object.keys(committedFiles)) {
      if (!(file in s.workingDirectory)) {
        s.stagingArea[file] = '__DELETED__';
        added++;
      }
    }
    if (added === 0) return result(true, 'nothing to add (working tree clean)', s, 'add');
    return result(true, `Added ${added} file(s) to staging area`, s, 'add');
  }

  const file = args[0];
  if (!(file in s.workingDirectory)) {
    const headFiles = headCommit?.files ?? {};
    if (file in headFiles) {
      s.stagingArea[file] = '__DELETED__';
      return result(true, `Staged deletion of '${file}'`, s, 'add');
    }
    return errorResult(`fatal: pathspec '${file}' did not match any files`, s);
  }
  s.stagingArea[file] = s.workingDirectory[file];
  return result(true, `Added '${file}' to staging area`, s, 'add');
}

// ─── git commit ────────────────────────────────────────────────────────────────

function handleCommit(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  let message = '';
  const mIdx = args.indexOf('-m');
  if (mIdx !== -1 && args[mIdx + 1]) {
    message = args[mIdx + 1].replace(/^["']|["']$/g, '');
  } else {
    return errorResult('error: switch `m` requires a value', state);
  }

  if (Object.keys(state.stagingArea).length === 0) {
    return errorResult('nothing to commit (create/copy files and use "git add" to track)', state);
  }

  const s = cloneState(state);
  const parentId = getHeadCommitId(s);
  const parentCommit = parentId ? s.commits[parentId] : null;
  const parentFiles = parentCommit?.files ?? {};

  const newFiles: Record<string, string> = { ...parentFiles };
  for (const [file, content] of Object.entries(s.stagingArea)) {
    if (content === '__DELETED__') {
      delete newFiles[file];
    } else {
      newFiles[file] = content;
    }
  }

  const currentBranch = getCurrentBranch(s) ?? 'main';
  const commitId = generateId();
  const commit: GitCommit = {
    id: commitId,
    message,
    parentIds: parentId && parentId !== '' ? [parentId] : [],
    timestamp: Date.now(),
    files: newFiles,
    branch: currentBranch,
  };

  s.commits[commitId] = commit;
  s.commitOrder.push(commitId);

  if (!s.detachedHead) {
    const branch = s.branches.find(b => b.name === s.head);
    if (branch) branch.commitId = commitId;
  } else {
    s.head = commitId;
  }

  s.stagingArea = {};
  s.workingDirectory = { ...newFiles };

  const fileCount = Object.keys(state.stagingArea).length;
  return result(
    true,
    `[${currentBranch} ${commitId}] ${message}\n ${fileCount} file(s) changed`,
    s,
    'commit',
  );
}

// ─── git branch ────────────────────────────────────────────────────────────────

function handleBranch(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const hasRemoteFlag = args.includes('-r') || args.includes('--remotes');
  const hasAllFlag = args.includes('-a') || args.includes('--all');

  if (args.length === 0 || args[0] === '-l' || args[0] === '--list' || hasRemoteFlag || hasAllFlag) {
    const current = getCurrentBranch(state);
    const lines: string[] = [];

    if (!hasRemoteFlag) {
      for (const b of state.branches) {
        lines.push(b.name === current ? `* ${b.name}` : `  ${b.name}`);
      }
    }

    if (hasRemoteFlag || hasAllFlag) {
      for (const rb of state.remoteState.branches) {
        const remoteName = state.remotes[0]?.name ?? 'origin';
        lines.push(`  remotes/${remoteName}/${rb.name}`);
      }
    }

    if (lines.length === 0) return result(true, 'No branches yet', state, 'branch-list');
    return result(true, lines.join('\n'), state, 'branch-list');
  }

  if (args[0] === '-d' || args[0] === '-D' || args[0] === '--delete') {
    const name = args[1];
    if (!name) return errorResult('fatal: branch name required', state);
    if (name === getCurrentBranch(state)) {
      return errorResult(`error: Cannot delete branch '${name}' checked out`, state);
    }
    const s = cloneState(state);
    const idx = s.branches.findIndex(b => b.name === name);
    if (idx === -1) return errorResult(`error: branch '${name}' not found`, state);
    s.branches.splice(idx, 1);
    return result(true, `Deleted branch ${name}`, s, 'branch-create');
  }

  const name = args[0];
  if (state.branches.some(b => b.name === name)) {
    return errorResult(`fatal: A branch named '${name}' already exists`, state);
  }

  const headCommitId = getHeadCommitId(state);
  if (!headCommitId || headCommitId === '') {
    return errorResult('fatal: Not a valid object name: no commits yet', state);
  }

  const s = cloneState(state);
  s.branches.push({ name, commitId: headCommitId });
  return result(true, `Created branch '${name}' at ${headCommitId}`, s, 'branch-create');
}

// ─── git checkout / switch ─────────────────────────────────────────────────────

function handleCheckout(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('error: you must specify a branch or commit', state);

  const createNew = args[0] === '-b';
  const target = createNew ? args[1] : args[0];
  if (!target) return errorResult('error: switch `b` requires a value', state);

  const s = cloneState(state);

  if (createNew) {
    if (s.branches.some(b => b.name === target)) {
      return errorResult(`fatal: A branch named '${target}' already exists`, state);
    }
    const headCommitId = getHeadCommitId(s);
    if (!headCommitId || headCommitId === '') {
      s.branches.push({ name: target, commitId: '' });
      s.head = target;
      s.detachedHead = false;
      return result(true, `Switched to a new branch '${target}'`, s, 'checkout');
    }
    s.branches.push({ name: target, commitId: headCommitId });
    s.head = target;
    s.detachedHead = false;

    const commit = s.commits[headCommitId];
    if (commit) {
      s.workingDirectory = { ...commit.files };
      s.stagingArea = {};
    }
    return result(true, `Switched to a new branch '${target}'`, s, 'checkout');
  }

  const branch = s.branches.find(b => b.name === target);
  if (branch) {
    s.head = target;
    s.detachedHead = false;
    if (branch.commitId && s.commits[branch.commitId]) {
      s.workingDirectory = { ...s.commits[branch.commitId].files };
      s.stagingArea = {};
    }
    return result(true, `Switched to branch '${target}'`, s, 'checkout');
  }

  if (s.commits[target]) {
    s.head = target;
    s.detachedHead = true;
    s.workingDirectory = { ...s.commits[target].files };
    s.stagingArea = {};
    return result(
      true,
      `HEAD is now at ${target} (detached HEAD state)`,
      s,
      'checkout',
    );
  }

  return errorResult(`error: pathspec '${target}' did not match any branch or commit`, state);
}

// ─── git merge ─────────────────────────────────────────────────────────────────

function handleMerge(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('error: specify a branch to merge', state);

  const targetBranchName = args[0];
  const targetBranch = state.branches.find(b => b.name === targetBranchName);
  if (!targetBranch) return errorResult(`merge: '${targetBranchName}' - not something we can merge`, state);

  const currentCommitId = getHeadCommitId(state);
  if (!currentCommitId || currentCommitId === '') {
    return errorResult('fatal: no commits on current branch', state);
  }

  const targetCommitId = targetBranch.commitId;
  if (!targetCommitId || targetCommitId === '') {
    return errorResult(`fatal: branch '${targetBranchName}' has no commits`, state);
  }

  if (currentCommitId === targetCommitId) {
    return result(true, 'Already up to date.', state, 'merge');
  }

  const s = cloneState(state);

  if (isAncestor(s, currentCommitId, targetCommitId)) {
    const currentBranch = s.branches.find(b => b.name === s.head);
    if (currentBranch) currentBranch.commitId = targetCommitId;
    const targetCommit = s.commits[targetCommitId];
    if (targetCommit) {
      s.workingDirectory = { ...targetCommit.files };
      s.stagingArea = {};
    }
    return result(
      true,
      `Fast-forward merge: ${s.head} -> ${targetCommitId}`,
      s,
      'merge-fast-forward',
    );
  }

  const currentCommit = s.commits[currentCommitId];
  const targetCommit = s.commits[targetCommitId];
  const mergedFiles: Record<string, string> = {
    ...currentCommit.files,
    ...targetCommit.files,
  };

  const mergeCommitId = generateId();
  const currentBranchName = getCurrentBranch(s) ?? 'main';
  const mergeCommit: GitCommit = {
    id: mergeCommitId,
    message: `Merge branch '${targetBranchName}' into ${currentBranchName}`,
    parentIds: [currentCommitId, targetCommitId],
    timestamp: Date.now(),
    files: mergedFiles,
    branch: currentBranchName,
  };

  s.commits[mergeCommitId] = mergeCommit;
  s.commitOrder.push(mergeCommitId);

  const branch = s.branches.find(b => b.name === s.head);
  if (branch) branch.commitId = mergeCommitId;
  s.workingDirectory = { ...mergedFiles };
  s.stagingArea = {};

  return result(
    true,
    `Merge made by the 'ort' strategy.\nMerge branch '${targetBranchName}' into ${currentBranchName}`,
    s,
    'merge',
  );
}

// ─── git rebase ────────────────────────────────────────────────────────────────

function handleRebase(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('error: specify a branch to rebase onto', state);

  const targetBranchName = args[0];
  const targetBranch = state.branches.find(b => b.name === targetBranchName);
  if (!targetBranch) return errorResult(`fatal: invalid upstream '${targetBranchName}'`, state);

  const currentCommitId = getHeadCommitId(state);
  if (!currentCommitId) return errorResult('fatal: no commits on current branch', state);
  const targetCommitId = targetBranch.commitId;
  if (!targetCommitId) return errorResult(`fatal: branch '${targetBranchName}' has no commits`, state);

  if (currentCommitId === targetCommitId) {
    return result(true, `Current branch is up to date with '${targetBranchName}'.`, state, 'rebase');
  }

  const s = cloneState(state);
  const currentBranch = getCurrentBranch(s) ?? 'main';

  const commitsToRebase: string[] = [];
  let cursor = currentCommitId;
  const targetAncestors = getCommitAncestors(s, targetCommitId);
  while (cursor && !targetAncestors.has(cursor)) {
    commitsToRebase.unshift(cursor);
    const commit = s.commits[cursor];
    cursor = commit?.parentIds[0] ?? '';
  }

  let parentId = targetCommitId;
  for (const oldId of commitsToRebase) {
    const oldCommit = s.commits[oldId];
    const newId = generateId();
    const newCommit: GitCommit = {
      id: newId,
      message: oldCommit.message,
      parentIds: [parentId],
      timestamp: Date.now(),
      files: { ...oldCommit.files },
      branch: currentBranch,
    };
    s.commits[newId] = newCommit;
    s.commitOrder.push(newId);
    parentId = newId;
  }

  const branch = s.branches.find(b => b.name === s.head);
  if (branch) branch.commitId = parentId;
  const lastCommit = s.commits[parentId];
  if (lastCommit) {
    s.workingDirectory = { ...lastCommit.files };
    s.stagingArea = {};
  }

  return result(
    true,
    `Successfully rebased ${currentBranch} onto ${targetBranchName}.\nReplayed ${commitsToRebase.length} commit(s).`,
    s,
    'rebase',
  );
}

// ─── git reset ─────────────────────────────────────────────────────────────────

function handleReset(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  let mode: 'soft' | 'mixed' | 'hard' = 'mixed';
  let target = '';

  for (const arg of args) {
    if (arg === '--soft') mode = 'soft';
    else if (arg === '--mixed') mode = 'mixed';
    else if (arg === '--hard') mode = 'hard';
    else target = arg;
  }

  const s = cloneState(state);

  if (target === '' || target === 'HEAD') {
    if (mode === 'hard') {
      const headCommit = getHeadCommit(s);
      s.stagingArea = {};
      if (headCommit) s.workingDirectory = { ...headCommit.files };
      return result(true, `HEAD is now at ${getHeadCommitId(s)}`, s, 'reset-hard');
    }
    if (mode === 'mixed') {
      s.stagingArea = {};
      return result(true, 'Unstaged changes after reset', s, 'reset-mixed');
    }
    return result(true, 'Nothing to reset', s, 'reset-soft');
  }

  let targetCommitId = target;
  if (target.startsWith('HEAD~')) {
    const steps = parseInt(target.slice(5)) || 1;
    let currentId = getHeadCommitId(s);
    for (let i = 0; i < steps && currentId; i++) {
      const commit = s.commits[currentId];
      currentId = commit?.parentIds[0] ?? null;
    }
    if (!currentId) return errorResult(`fatal: could not resolve '${target}'`, state);
    targetCommitId = currentId;
  }

  if (!s.commits[targetCommitId]) {
    return errorResult(`fatal: ambiguous argument '${target}'`, state);
  }

  const targetCommit = s.commits[targetCommitId];

  if (!s.detachedHead) {
    const branch = s.branches.find(b => b.name === s.head);
    if (branch) branch.commitId = targetCommitId;
  } else {
    s.head = targetCommitId;
  }

  const actionMap = { soft: 'reset-soft', mixed: 'reset-mixed', hard: 'reset-hard' } as const;

  if (mode === 'soft') {
    return result(true, `HEAD is now at ${targetCommitId}`, s, actionMap[mode]);
  }

  if (mode === 'mixed') {
    s.stagingArea = {};
    return result(true, `Unstaged changes after reset to ${targetCommitId}`, s, actionMap[mode]);
  }

  s.stagingArea = {};
  s.workingDirectory = { ...targetCommit.files };
  return result(true, `HEAD is now at ${targetCommitId}`, s, actionMap[mode]);
}

// ─── git revert ────────────────────────────────────────────────────────────────

function handleRevert(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('usage: git revert <commit>', state);

  let targetId = args[0];
  if (targetId === 'HEAD') {
    targetId = getHeadCommitId(state) ?? '';
  } else if (targetId.startsWith('HEAD~')) {
    const steps = parseInt(targetId.slice(5)) || 1;
    let cur = getHeadCommitId(state);
    for (let i = 0; i < steps && cur; i++) {
      const c = state.commits[cur];
      cur = c?.parentIds[0] ?? null;
    }
    if (!cur) return errorResult(`fatal: could not resolve '${args[0]}'`, state);
    targetId = cur;
  }

  const targetCommit = state.commits[targetId];
  if (!targetCommit) return errorResult(`fatal: bad object ${args[0]}`, state);

  const parentId = targetCommit.parentIds[0];
  const parentCommit = parentId ? state.commits[parentId] : null;
  const parentFiles = parentCommit?.files ?? {};

  const s = cloneState(state);
  const currentCommitId = getHeadCommitId(s);
  const currentCommit = currentCommitId ? s.commits[currentCommitId] : null;
  const currentFiles = currentCommit?.files ?? {};

  const revertedFiles = { ...currentFiles };
  for (const file of Object.keys(targetCommit.files)) {
    const parentContent = parentFiles[file];
    if (parentContent === undefined) {
      delete revertedFiles[file];
    } else {
      revertedFiles[file] = parentContent;
    }
  }
  for (const file of Object.keys(parentFiles)) {
    if (!(file in targetCommit.files) && !(file in revertedFiles)) {
      revertedFiles[file] = parentFiles[file];
    }
  }

  const currentBranch = getCurrentBranch(s) ?? 'HEAD';
  const newId = generateId();
  const newCommit: GitCommit = {
    id: newId,
    message: `Revert "${targetCommit.message}"`,
    parentIds: currentCommitId ? [currentCommitId] : [],
    timestamp: Date.now(),
    files: revertedFiles,
    branch: currentBranch,
  };

  s.commits[newId] = newCommit;
  s.commitOrder.push(newId);

  if (!s.detachedHead) {
    const branch = s.branches.find(b => b.name === s.head);
    if (branch) branch.commitId = newId;
  } else {
    s.head = newId;
  }

  s.workingDirectory = { ...revertedFiles };
  s.stagingArea = {};

  return result(true, `[${currentBranch} ${newId}] Revert "${targetCommit.message}"`, s, 'revert');
}

// ─── git stash ─────────────────────────────────────────────────────────────────

function handleStash(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const subcommand = args[0] ?? 'push';

  if (subcommand === 'push' || subcommand === 'save') {
    const headCommit = getHeadCommit(state);
    const committedFiles = headCommit?.files ?? {};
    const hasWorkingChanges = Object.keys(state.workingDirectory).some(
      f => state.workingDirectory[f] !== committedFiles[f],
    ) || Object.keys(committedFiles).some(f => !(f in state.workingDirectory));
    const hasStagedChanges = Object.keys(state.stagingArea).length > 0;

    if (!hasWorkingChanges && !hasStagedChanges) {
      return errorResult('No local changes to save', state);
    }

    const s = cloneState(state);
    const entry: GitStashEntry = {
      id: s.stash.length,
      message: `WIP on ${getCurrentBranch(s) ?? 'HEAD'}`,
      files: { ...s.workingDirectory },
      stagedFiles: { ...s.stagingArea },
      branch: getCurrentBranch(s) ?? '',
    };
    s.stash.unshift(entry);
    s.stagingArea = {};
    s.workingDirectory = headCommit ? { ...headCommit.files } : {};

    return result(true, `Saved working directory and index state "${entry.message}"`, s, 'stash-push');
  }

  if (subcommand === 'pop') {
    if (state.stash.length === 0) return errorResult('error: no stash entries found', state);
    const s = cloneState(state);
    const entry = s.stash.shift()!;
    s.workingDirectory = { ...entry.files };
    s.stagingArea = { ...entry.stagedFiles };
    return result(true, `Restored stash@{0}: ${entry.message}\nDropped stash@{0}`, s, 'stash-pop');
  }

  if (subcommand === 'list') {
    if (state.stash.length === 0) return result(true, 'No stash entries', state, 'stash-push');
    const lines = state.stash.map((e, i) => `stash@{${i}}: ${e.message}`);
    return result(true, lines.join('\n'), state, 'stash-push');
  }

  if (subcommand === 'drop') {
    if (state.stash.length === 0) return errorResult('error: no stash entries found', state);
    const s = cloneState(state);
    s.stash.shift();
    return result(true, 'Dropped stash@{0}', s, 'stash-pop');
  }

  return errorResult(`error: unknown stash subcommand '${subcommand}'`, state);
}

// ─── git cherry-pick ───────────────────────────────────────────────────────────

function handleCherryPick(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);
  if (args.length === 0) return errorResult('error: specify a commit to cherry-pick', state);

  const targetId = args[0];
  const targetCommit = state.commits[targetId];
  if (!targetCommit) return errorResult(`fatal: bad object ${targetId}`, state);

  const s = cloneState(state);
  const currentCommitId = getHeadCommitId(s);
  const currentCommit = currentCommitId ? s.commits[currentCommitId] : null;
  const currentFiles = currentCommit?.files ?? {};

  const newFiles: Record<string, string> = { ...currentFiles, ...targetCommit.files };
  const currentBranch = getCurrentBranch(s) ?? 'HEAD';

  const newId = generateId();
  const newCommit: GitCommit = {
    id: newId,
    message: targetCommit.message,
    parentIds: currentCommitId ? [currentCommitId] : [],
    timestamp: Date.now(),
    files: newFiles,
    branch: currentBranch,
  };

  s.commits[newId] = newCommit;
  s.commitOrder.push(newId);

  if (!s.detachedHead) {
    const branch = s.branches.find(b => b.name === s.head);
    if (branch) branch.commitId = newId;
  } else {
    s.head = newId;
  }

  s.workingDirectory = { ...newFiles };
  s.stagingArea = {};

  return result(true, `[${currentBranch} ${newId}] ${targetCommit.message}`, s, 'cherry-pick');
}

// ─── git tag ───────────────────────────────────────────────────────────────────

function handleTag(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  if (args.length === 0) {
    if (state.tags.length === 0) return result(true, 'No tags', state, 'tag');
    return result(true, state.tags.map(t => t.name).join('\n'), state, 'tag');
  }

  if (args[0] === '-d' || args[0] === '--delete') {
    const name = args[1];
    if (!name) return errorResult('fatal: tag name required', state);
    const s = cloneState(state);
    const idx = s.tags.findIndex(t => t.name === name);
    if (idx === -1) return errorResult(`error: tag '${name}' not found`, state);
    s.tags.splice(idx, 1);
    return result(true, `Deleted tag '${name}'`, s, 'tag');
  }

  const name = args[0];
  if (state.tags.some(t => t.name === name)) {
    return errorResult(`fatal: tag '${name}' already exists`, state);
  }

  const commitId = args[1] ?? getHeadCommitId(state);
  if (!commitId) return errorResult('fatal: no commits yet', state);

  const s = cloneState(state);
  s.tags.push({ name, commitId });
  return result(true, `Created tag '${name}' at ${commitId}`, s, 'tag');
}

// ─── git remote ────────────────────────────────────────────────────────────────

function handleRemote(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  if (args.length === 0 || args[0] === '-v') {
    if (state.remotes.length === 0) return result(true, 'No remotes configured', state, 'remote');
    const verbose = args[0] === '-v';
    const lines = state.remotes.map(r =>
      verbose ? `${r.name}\t${r.url} (fetch)\n${r.name}\t${r.url} (push)` : r.name,
    );
    return result(true, lines.join('\n'), state, 'remote');
  }

  if (args[0] === 'add') {
    const name = args[1];
    const url = args[2];
    if (!name || !url) return errorResult('usage: git remote add <name> <url>', state);
    if (state.remotes.some(r => r.name === name)) {
      return errorResult(`error: remote ${name} already exists`, state);
    }
    const s = cloneState(state);
    s.remotes.push({ name, url });
    return result(true, `Added remote '${name}' -> ${url}`, s, 'remote');
  }

  if (args[0] === 'remove' || args[0] === 'rm') {
    const name = args[1];
    if (!name) return errorResult('usage: git remote remove <name>', state);
    const s = cloneState(state);
    const idx = s.remotes.findIndex(r => r.name === name);
    if (idx === -1) return errorResult(`fatal: No such remote: '${name}'`, state);
    s.remotes.splice(idx, 1);
    return result(true, `Removed remote '${name}'`, s, 'remote');
  }

  return errorResult(`error: unknown subcommand '${args[0]}'`, state);
}

// ─── git push ──────────────────────────────────────────────────────────────────

function handlePush(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const setUpstream = args.includes('-u') || args.includes('--set-upstream');
  const filteredArgs = args.filter(a => a !== '-u' && a !== '--set-upstream');

  let remoteName = filteredArgs[0] ?? state.remotes[0]?.name;
  let branchName = filteredArgs[1] ?? getCurrentBranch(state);

  if (!remoteName) {
    return errorResult("fatal: No configured push destination.\nRun `git remote add origin <url>` first.", state);
  }
  if (!branchName) return errorResult('fatal: not on a branch, cannot push', state);

  const remote = state.remotes.find(r => r.name === remoteName);
  if (!remote) return errorResult(`fatal: '${remoteName}' does not appear to be a git repository`, state);

  const localBranch = state.branches.find(b => b.name === branchName);
  if (!localBranch) return errorResult(`error: src refspec '${branchName}' does not match any`, state);
  if (!localBranch.commitId || localBranch.commitId === '') {
    return errorResult('error: no commits on branch, nothing to push', state);
  }

  const s = cloneState(state);

  const localAncestors = getCommitAncestors(s, localBranch.commitId);
  for (const cid of localAncestors) {
    if (!s.remoteState.commits[cid]) {
      s.remoteState.commits[cid] = { ...s.commits[cid] };
      if (!s.remoteState.commitOrder.includes(cid)) {
        s.remoteState.commitOrder.push(cid);
      }
    }
  }

  const remoteBranch = s.remoteState.branches.find(b => b.name === branchName);
  if (remoteBranch) {
    remoteBranch.commitId = localBranch.commitId;
  } else {
    s.remoteState.branches.push({ name: branchName!, commitId: localBranch.commitId });
  }

  if (setUpstream) {
    s.trackingBranches[branchName!] = `${remoteName}/${branchName}`;
  }

  const commitCount = localAncestors.size;
  return result(
    true,
    `Enumerating objects: ${commitCount}, done.\nCounting objects: 100% (${commitCount}/${commitCount}), done.\nTo ${remote.url}\n   ${localBranch.commitId.slice(0, 7)}  ${branchName} -> ${branchName}`,
    s,
    'push',
  );
}

// ─── git fetch ─────────────────────────────────────────────────────────────────

function handleFetch(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const remoteName = args[0] ?? state.remotes[0]?.name;
  if (!remoteName) return errorResult('fatal: No remote repository specified.', state);

  const remote = state.remotes.find(r => r.name === remoteName);
  if (!remote) return errorResult(`fatal: '${remoteName}' does not appear to be a git repository`, state);

  const s = cloneState(state);

  let newObjects = 0;
  for (const [cid, commit] of Object.entries(s.remoteState.commits)) {
    if (!s.commits[cid]) {
      s.commits[cid] = { ...commit };
      if (!s.commitOrder.includes(cid)) {
        s.commitOrder.push(cid);
      }
      newObjects++;
    }
  }

  const lines = [`From ${remote.url}`];
  for (const rb of s.remoteState.branches) {
    lines.push(` * [${newObjects > 0 ? 'new branch' : 'up to date'}]  ${rb.name} -> ${remoteName}/${rb.name}`);
  }

  return result(true, lines.join('\n'), s, 'fetch');
}

// ─── git pull ──────────────────────────────────────────────────────────────────

function handlePull(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const remoteName = args[0] ?? state.remotes[0]?.name;
  const branchName = args[1] ?? getCurrentBranch(state);

  if (!remoteName) return errorResult('fatal: No remote repository specified.', state);
  if (!branchName) return errorResult('fatal: not on a branch, cannot pull', state);

  const remote = state.remotes.find(r => r.name === remoteName);
  if (!remote) return errorResult(`fatal: '${remoteName}' does not appear to be a git repository`, state);

  const remoteBranch = state.remoteState.branches.find(b => b.name === branchName);
  if (!remoteBranch) {
    return errorResult(`fatal: couldn't find remote ref '${branchName}'`, state);
  }

  const s = cloneState(state);

  for (const [cid, commit] of Object.entries(s.remoteState.commits)) {
    if (!s.commits[cid]) {
      s.commits[cid] = { ...commit };
      if (!s.commitOrder.includes(cid)) {
        s.commitOrder.push(cid);
      }
    }
  }

  const localBranch = s.branches.find(b => b.name === branchName);
  const localCommitId = localBranch?.commitId;
  const remoteCommitId = remoteBranch.commitId;

  if (localCommitId === remoteCommitId) {
    return result(true, 'Already up to date.', s, 'pull');
  }

  if (!localCommitId || localCommitId === '') {
    if (localBranch) localBranch.commitId = remoteCommitId;
    const commit = s.commits[remoteCommitId];
    if (commit) {
      s.workingDirectory = { ...commit.files };
      s.stagingArea = {};
    }
    return result(true, `From ${remote.url}\nFast-forward to ${remoteCommitId}`, s, 'pull');
  }

  if (isAncestor(s, localCommitId, remoteCommitId)) {
    if (localBranch) localBranch.commitId = remoteCommitId;
    const commit = s.commits[remoteCommitId];
    if (commit) {
      s.workingDirectory = { ...commit.files };
      s.stagingArea = {};
    }
    return result(
      true,
      `From ${remote.url}\nUpdating ${localCommitId.slice(0, 7)}..${remoteCommitId.slice(0, 7)}\nFast-forward`,
      s,
      'pull',
    );
  }

  const localCommit = s.commits[localCommitId];
  const remoteCommit = s.commits[remoteCommitId];
  if (!localCommit || !remoteCommit) {
    return errorResult('fatal: unable to merge histories', state);
  }

  const mergedFiles = { ...localCommit.files, ...remoteCommit.files };
  const mergeId = generateId();
  const mergeCommit: GitCommit = {
    id: mergeId,
    message: `Merge remote-tracking branch '${remoteName}/${branchName}'`,
    parentIds: [localCommitId, remoteCommitId],
    timestamp: Date.now(),
    files: mergedFiles,
    branch: branchName,
  };

  s.commits[mergeId] = mergeCommit;
  s.commitOrder.push(mergeId);
  if (localBranch) localBranch.commitId = mergeId;
  s.workingDirectory = { ...mergedFiles };
  s.stagingArea = {};

  return result(
    true,
    `From ${remote.url}\nMerge made by the 'ort' strategy.`,
    s,
    'pull',
  );
}

// ─── git clone ─────────────────────────────────────────────────────────────────

function handleClone(state: GitState, args: string[]): GitCommandResult {
  if (state.initialized) return errorResult('fatal: destination path already exists and is not empty', state);
  if (args.length === 0) return errorResult('usage: git clone <url>', state);

  const url = args[0];
  const s = cloneState(state);
  s.initialized = true;
  s.head = 'main';
  s.branches = [{ name: 'main', commitId: '' }];
  s.remotes = [{ name: 'origin', url }];
  s.trackingBranches = { main: 'origin/main' };

  const commitId = generateId();
  const commit: GitCommit = {
    id: commitId,
    message: 'Initial commit (cloned)',
    parentIds: [],
    timestamp: Date.now(),
    files: { 'README.md': `# Cloned from ${url}` },
    branch: 'main',
  };

  s.commits[commitId] = commit;
  s.commitOrder.push(commitId);
  s.branches[0].commitId = commitId;
  s.workingDirectory = { ...commit.files };

  s.remoteState.commits[commitId] = { ...commit };
  s.remoteState.commitOrder.push(commitId);
  s.remoteState.branches.push({ name: 'main', commitId });

  return result(
    true,
    `Cloning into '${url.split('/').pop() ?? 'repo'}'...\nremote: Enumerating objects: 1, done.\nReceiving objects: 100% (1/1), done.`,
    s,
    'clone',
  );
}

// ─── git log ───────────────────────────────────────────────────────────────────

function handleLog(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const headCommitId = getHeadCommitId(state);
  if (!headCommitId || headCommitId === '') {
    return result(true, 'No commits yet', state, 'log');
  }

  const isOneline = args.includes('--oneline');
  const isAll = args.includes('--all');
  const isGraph = args.includes('--graph');

  let commitIds: string[];
  if (isAll) {
    commitIds = [...state.commitOrder].reverse();
  } else {
    commitIds = [];
    const visited = new Set<string>();
    const stack = [headCommitId];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      commitIds.push(id);
      const commit = state.commits[id];
      if (commit) stack.push(...commit.parentIds);
    }
  }

  const currentBranch = getCurrentBranch(state);
  const lines: string[] = [];

  for (const id of commitIds) {
    const commit = state.commits[id];
    if (!commit) continue;

    const branchLabels = state.branches
      .filter(b => b.commitId === id)
      .map(b => b.name);
    const tagLabels = state.tags.filter(t => t.commitId === id).map(t => `tag: ${t.name}`);
    const refs = [...branchLabels.map(b => b === currentBranch ? `HEAD -> ${b}` : b), ...tagLabels];
    const refStr = refs.length > 0 ? ` (${refs.join(', ')})` : '';

    const graphPrefix = isGraph ? '* ' : '';

    if (isOneline) {
      lines.push(`${graphPrefix}${id} ${refStr}${commit.message}`);
    } else {
      lines.push(`${graphPrefix}commit ${id}${refStr}`);
      lines.push(`  ${commit.message}`);
      lines.push('');
    }
  }

  return result(true, lines.join('\n') || 'No commits', state, 'log');
}

// ─── git status ────────────────────────────────────────────────────────────────

function handleStatus(state: GitState): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const currentBranch = getCurrentBranch(state);
  const lines: string[] = [];

  if (currentBranch) {
    lines.push(`On branch ${currentBranch}`);
    const tracking = state.trackingBranches[currentBranch];
    if (tracking) {
      lines.push(`Your branch is tracking '${tracking}'`);
    }
  } else {
    lines.push(`HEAD detached at ${state.head}`);
  }

  const headCommit = getHeadCommit(state);
  const committedFiles = headCommit?.files ?? {};

  const staged: string[] = [];
  for (const [file, content] of Object.entries(state.stagingArea)) {
    if (content === '__DELETED__') {
      staged.push(`  deleted:    ${file}`);
    } else if (!(file in committedFiles)) {
      staged.push(`  new file:   ${file}`);
    } else {
      staged.push(`  modified:   ${file}`);
    }
  }

  if (staged.length > 0) {
    lines.push('');
    lines.push('Changes to be committed:');
    lines.push(...staged);
  }

  const modified: string[] = [];
  const untracked: string[] = [];
  for (const file of Object.keys(state.workingDirectory)) {
    if (file in state.stagingArea) continue;
    if (!(file in committedFiles)) {
      untracked.push(`  ${file}`);
    } else if (state.workingDirectory[file] !== committedFiles[file]) {
      modified.push(`  modified:   ${file}`);
    }
  }

  if (modified.length > 0) {
    lines.push('');
    lines.push('Changes not staged for commit:');
    lines.push(...modified);
  }

  if (untracked.length > 0) {
    lines.push('');
    lines.push('Untracked files:');
    lines.push(...untracked);
  }

  if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
    if (!headCommit) {
      lines.push('');
      lines.push('No commits yet');
    } else {
      lines.push('');
      lines.push('nothing to commit, working tree clean');
    }
  }

  return result(true, lines.join('\n'), state, 'status');
}

// ─── git diff ──────────────────────────────────────────────────────────────────

function handleDiff(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const isStaged = args.includes('--staged') || args.includes('--cached');

  const headCommit = getHeadCommit(state);
  const committedFiles = headCommit?.files ?? {};
  const lines: string[] = [];

  if (isStaged) {
    for (const [file, content] of Object.entries(state.stagingArea)) {
      const committed = committedFiles[file];
      lines.push(`diff --git a/${file} b/${file}`);
      if (content === '__DELETED__') {
        lines.push(`--- a/${file}`);
        lines.push(`+++ /dev/null`);
        lines.push(`- ${committed}`);
      } else if (!committed) {
        lines.push(`--- /dev/null`);
        lines.push(`+++ b/${file}`);
        lines.push(`+ ${content}`);
      } else {
        lines.push(`--- a/${file}`);
        lines.push(`+++ b/${file}`);
        lines.push(`- ${committed}`);
        lines.push(`+ ${content}`);
      }
      lines.push('');
    }
    return result(true, lines.join('\n') || 'No staged differences', state, 'diff');
  }

  const allFiles = new Set([
    ...Object.keys(state.workingDirectory),
    ...Object.keys(committedFiles),
  ]);

  for (const file of allFiles) {
    if (file in state.stagingArea) continue;
    const wd = state.workingDirectory[file];
    const committed = committedFiles[file];
    if (wd === committed) continue;

    lines.push(`diff --git a/${file} b/${file}`);
    if (!committed) {
      lines.push(`--- /dev/null`);
      lines.push(`+++ b/${file}`);
      lines.push(`+ ${wd}`);
    } else if (!wd) {
      lines.push(`--- a/${file}`);
      lines.push(`+++ /dev/null`);
      lines.push(`- ${committed}`);
    } else {
      lines.push(`--- a/${file}`);
      lines.push(`+++ b/${file}`);
      lines.push(`- ${committed}`);
      lines.push(`+ ${wd}`);
    }
    lines.push('');
  }

  return result(true, lines.join('\n') || 'No differences', state, 'diff');
}

// ─── shell helpers: touch, edit, rm, ls, cat, mv, echo ─────────────────────────

function handleTouch(state: GitState, args: string[]): GitCommandResult {
  if (args.length === 0) return errorResult('usage: touch <filename> [content]', state);
  const s = cloneState(state);
  const filename = args[0];
  const content = args.slice(1).join(' ') || `content of ${filename}`;
  s.workingDirectory[filename] = content;
  return result(true, `Created file '${filename}'`, s, 'add');
}

function handleEdit(state: GitState, args: string[]): GitCommandResult {
  if (args.length < 2) return errorResult('usage: edit <filename> <content>', state);
  const filename = args[0];
  if (!(filename in state.workingDirectory)) {
    return errorResult(`error: file '${filename}' does not exist`, state);
  }
  const s = cloneState(state);
  s.workingDirectory[filename] = args.slice(1).join(' ');
  return result(true, `Modified '${filename}'`, s, 'add');
}

function handleRm(state: GitState, args: string[]): GitCommandResult {
  if (args.length === 0) return errorResult('usage: rm <filename>', state);
  const filename = args[0];
  if (!(filename in state.workingDirectory)) {
    return errorResult(`fatal: pathspec '${filename}' did not match any files`, state);
  }
  const s = cloneState(state);
  delete s.workingDirectory[filename];
  return result(true, `Removed '${filename}'`, s, 'add');
}

function handleMv(state: GitState, args: string[]): GitCommandResult {
  if (args.length < 2) return errorResult('usage: mv <source> <destination>', state);
  const src = args[0];
  const dst = args[1];
  if (!(src in state.workingDirectory)) {
    return errorResult(`fatal: bad source, source='${src}', destination='${dst}'`, state);
  }
  const s = cloneState(state);
  s.workingDirectory[dst] = s.workingDirectory[src];
  delete s.workingDirectory[src];
  s.stagingArea[dst] = s.workingDirectory[dst];
  s.stagingArea[src] = '__DELETED__';
  return result(true, `Renamed '${src}' -> '${dst}'`, s, 'add');
}

function handleCat(state: GitState, args: string[]): GitCommandResult {
  if (args.length === 0) return errorResult('usage: cat <filename>', state);
  const filename = args[0];
  const content = state.workingDirectory[filename];
  if (content === undefined) {
    return errorResult(`cat: ${filename}: No such file or directory`, state);
  }
  return result(true, content, state, 'status');
}

function handleLs(state: GitState): GitCommandResult {
  const files = Object.keys(state.workingDirectory);
  if (files.length === 0) return result(true, '(empty working directory)', state, 'status');
  return result(true, files.join('\n'), state, 'status');
}

function handleEcho(state: GitState, args: string[]): GitCommandResult {
  const redirectIdx = args.indexOf('>');
  const appendIdx = args.indexOf('>>');

  if (appendIdx !== -1) {
    const content = args.slice(0, appendIdx).join(' ');
    const filename = args[appendIdx + 1];
    if (!filename) return errorResult('usage: echo <text> >> <file>', state);
    const s = cloneState(state);
    const existing = s.workingDirectory[filename] ?? '';
    s.workingDirectory[filename] = existing + (existing ? '\n' : '') + content;
    return result(true, '', s, 'add');
  }

  if (redirectIdx !== -1) {
    const content = args.slice(0, redirectIdx).join(' ');
    const filename = args[redirectIdx + 1];
    if (!filename) return errorResult('usage: echo <text> > <file>', state);
    const s = cloneState(state);
    s.workingDirectory[filename] = content;
    return result(true, '', s, 'add');
  }

  return result(true, args.join(' '), state, 'status');
}

// ─── help ──────────────────────────────────────────────────────────────────────

function handleHelp(): GitCommandResult {
  const helpText = `Available commands:

  Shell commands:
    touch <file> [content]  Create a new file
    edit <file> <content>   Modify file content
    rm <file>               Remove a file
    mv <src> <dst>          Move/rename a file
    cat <file>              Show file content
    echo <text> > <file>    Write text to file
    echo <text> >> <file>   Append text to file
    ls                      List working directory files

  Repository setup:
    git init                Initialize a new repository
    git clone <url>         Clone a remote repository
    git remote add <n> <u>  Add a remote
    git remote -v           List remotes
    git remote remove <n>   Remove a remote

  Staging & committing:
    git add <file|.>        Stage changes
    git commit -m "msg"     Create a commit
    git status              Show working tree status
    git diff [--staged]     Show working tree changes
    git log [--oneline] [--all] [--graph]
                            Show commit history

  Branching:
    git branch [name]       List or create branches
    git branch -d <name>    Delete a branch
    git branch -r           List remote branches
    git checkout <branch>   Switch branches
    git checkout -b <name>  Create & switch to new branch

  Merging & rebasing:
    git merge <branch>      Merge a branch
    git rebase <branch>     Rebase onto a branch
    git cherry-pick <id>    Apply a commit

  Remote sync:
    git push [-u] [remote] [branch]
                            Push commits to remote
    git pull [remote] [branch]
                            Fetch & merge from remote
    git fetch [remote]      Download remote changes

  Undo:
    git reset [--soft|--mixed|--hard] [target]
                            Reset current HEAD
    git revert <commit>     Revert a commit (creates new commit)
    git stash [push|pop|list|drop]
                            Stash working changes
    git tag [name] [commit] Create or list tags
    git tag -d <name>       Delete a tag

    help                    Show this help message
    clear                   Clear the terminal`;

  return { success: true, output: helpText, state: createInitialState(), action: 'log' };
}

// ─── main dispatcher ───────────────────────────────────────────────────────────

export function parseAndExecute(input: string, state: GitState): GitCommandResult {
  const trimmed = input.trim();
  if (!trimmed) return result(true, '', state);

  const tokens = tokenize(trimmed);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  if (cmd === 'help') {
    const helpResult = handleHelp();
    helpResult.state = state;
    return helpResult;
  }
  if (cmd === 'clear') return result(true, '__CLEAR__', state);

  if (cmd === 'touch') return handleTouch(state, args);
  if (cmd === 'edit') return handleEdit(state, args);
  if (cmd === 'rm') return handleRm(state, args);
  if (cmd === 'mv') return handleMv(state, args);
  if (cmd === 'cat') return handleCat(state, args);
  if (cmd === 'ls') return handleLs(state);
  if (cmd === 'echo') return handleEcho(state, args);
  if (cmd === 'mkdir') return result(true, `Created directory '${args[0] ?? ''}'`, state);
  if (cmd === 'pwd') return result(true, '/home/user/project', state);

  if (cmd !== 'git') {
    return errorResult(`command not found: ${cmd}. Type 'help' for available commands.`, state);
  }

  const subCmd = args[0];
  const subArgs = args.slice(1);

  switch (subCmd) {
    case 'init': return handleInit(state);
    case 'clone': return handleClone(state, subArgs);
    case 'add': return handleAdd(state, subArgs);
    case 'commit': return handleCommit(state, subArgs);
    case 'branch': return handleBranch(state, subArgs);
    case 'checkout': return handleCheckout(state, subArgs);
    case 'switch': return handleCheckout(state, subArgs);
    case 'merge': return handleMerge(state, subArgs);
    case 'rebase': return handleRebase(state, subArgs);
    case 'reset': return handleReset(state, subArgs);
    case 'revert': return handleRevert(state, subArgs);
    case 'stash': return handleStash(state, subArgs);
    case 'cherry-pick': return handleCherryPick(state, subArgs);
    case 'tag': return handleTag(state, subArgs);
    case 'log': return handleLog(state, subArgs);
    case 'status': return handleStatus(state);
    case 'diff': return handleDiff(state, subArgs);
    case 'remote': return handleRemote(state, subArgs);
    case 'push': return handlePush(state, subArgs);
    case 'pull': return handlePull(state, subArgs);
    case 'fetch': return handleFetch(state, subArgs);
    default:
      return errorResult(`git: '${subCmd}' is not a git command. See 'help'.`, state);
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}
