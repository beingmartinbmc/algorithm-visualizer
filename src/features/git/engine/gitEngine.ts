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
    'commit'
  );
}

function handleBranch(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  if (args.length === 0 || args[0] === '-l' || args[0] === '--list') {
    if (state.branches.length === 0) return result(true, 'No branches yet', state, 'branch-list');
    const current = getCurrentBranch(state);
    const lines = state.branches.map(b =>
      b.name === current ? `* ${b.name}` : `  ${b.name}`
    );
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
      'checkout'
    );
  }

  return errorResult(`error: pathspec '${target}' did not match any branch or commit`, state);
}

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
      'merge-fast-forward'
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
    'merge'
  );
}

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
    'rebase'
  );
}

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

  const targetExists = target.startsWith('HEAD~')
    ? true
    : !!s.commits[target];

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

  if (!targetExists && !s.commits[targetCommitId]) {
    return errorResult(`fatal: ambiguous argument '${target}'`, state);
  }

  const targetCommit = s.commits[targetCommitId];
  if (!targetCommit) return errorResult(`fatal: could not resolve '${target}'`, state);

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

function handleStash(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const subcommand = args[0] ?? 'push';

  if (subcommand === 'push' || subcommand === 'save') {
    const headCommit = getHeadCommit(state);
    const committedFiles = headCommit?.files ?? {};
    const hasWorkingChanges = Object.keys(state.workingDirectory).some(
      f => state.workingDirectory[f] !== committedFiles[f]
    );
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

  return errorResult(`error: unknown stash subcommand '${subcommand}'`, state);
}

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

function handleTag(state: GitState, args: string[]): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  if (args.length === 0) {
    if (state.tags.length === 0) return result(true, 'No tags', state, 'tag');
    return result(true, state.tags.map(t => t.name).join('\n'), state, 'tag');
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

function handleStatus(state: GitState): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const currentBranch = getCurrentBranch(state);
  const lines: string[] = [];

  if (currentBranch) {
    lines.push(`On branch ${currentBranch}`);
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

function handleDiff(state: GitState): GitCommandResult {
  if (!state.initialized) return errorResult('fatal: not a git repository', state);

  const headCommit = getHeadCommit(state);
  const committedFiles = headCommit?.files ?? {};
  const lines: string[] = [];

  const allFiles = new Set([
    ...Object.keys(state.workingDirectory),
    ...Object.keys(committedFiles),
  ]);

  for (const file of allFiles) {
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

function handleLs(state: GitState): GitCommandResult {
  const files = Object.keys(state.workingDirectory);
  if (files.length === 0) return result(true, '(empty working directory)', state, 'status');
  return result(true, files.join('\n'), state, 'status');
}

function handleHelp(): GitCommandResult {
  const helpText = `Available commands:

  File operations (simulated shell):
    touch <file> [content]  Create a new file
    edit <file> <content>   Modify file content
    rm <file>               Remove a file
    ls                      List working directory files

  Git commands:
    git init                Initialize a new repository
    git add <file|.>        Stage changes
    git commit -m "msg"     Create a commit
    git status              Show working tree status
    git log [--oneline] [--all] [--graph]
                            Show commit history
    git diff                Show working tree changes
    git branch [name]       List or create branches
    git branch -d <name>    Delete a branch
    git checkout <branch>   Switch branches
    git checkout -b <name>  Create & switch to new branch
    git merge <branch>      Merge a branch
    git rebase <branch>     Rebase onto a branch
    git reset [--soft|--mixed|--hard] [target]
                            Reset current HEAD
    git stash [push|pop|list]
                            Stash working changes
    git cherry-pick <id>    Apply a commit
    git tag [name] [commit] Create or list tags

    help                    Show this help message
    clear                   Clear the terminal`;

  return { success: true, output: helpText, state: createInitialState(), action: 'log' };
}

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
  if (cmd === 'ls') return handleLs(state);

  if (cmd !== 'git') {
    return errorResult(`command not found: ${cmd}. Type 'help' for available commands.`, state);
  }

  const subCmd = args[0];
  const subArgs = args.slice(1);

  switch (subCmd) {
    case 'init': return handleInit(state);
    case 'add': return handleAdd(state, subArgs);
    case 'commit': return handleCommit(state, subArgs);
    case 'branch': return handleBranch(state, subArgs);
    case 'checkout': return handleCheckout(state, subArgs);
    case 'switch': return handleCheckout(state, subArgs);
    case 'merge': return handleMerge(state, subArgs);
    case 'rebase': return handleRebase(state, subArgs);
    case 'reset': return handleReset(state, subArgs);
    case 'stash': return handleStash(state, subArgs);
    case 'cherry-pick': return handleCherryPick(state, subArgs);
    case 'tag': return handleTag(state, subArgs);
    case 'log': return handleLog(state, subArgs);
    case 'status': return handleStatus(state);
    case 'diff': return handleDiff(state);
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
