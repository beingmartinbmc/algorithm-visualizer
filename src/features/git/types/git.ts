export interface GitFile {
  name: string;
  content: string;
}

export interface GitCommit {
  id: string;
  message: string;
  parentIds: string[];
  timestamp: number;
  files: Record<string, string>;
  branch: string;
}

export interface GitBranch {
  name: string;
  commitId: string;
}

export interface GitTag {
  name: string;
  commitId: string;
}

export interface GitStashEntry {
  id: number;
  message: string;
  files: Record<string, string>;
  stagedFiles: Record<string, string>;
  branch: string;
}

export interface GitRemote {
  name: string;
  url: string;
}

export interface GitRemoteState {
  branches: GitBranch[];
  commits: Record<string, GitCommit>;
  commitOrder: string[];
}

export type FileStatus = 'untracked' | 'modified' | 'staged' | 'committed' | 'deleted';

export interface FileStatusEntry {
  name: string;
  workingStatus: FileStatus;
  stagingStatus: FileStatus;
}

export interface GitState {
  initialized: boolean;
  commits: Record<string, GitCommit>;
  branches: GitBranch[];
  tags: GitTag[];
  head: string;
  detachedHead: boolean;
  workingDirectory: Record<string, string>;
  stagingArea: Record<string, string>;
  stash: GitStashEntry[];
  commitOrder: string[];
  remotes: GitRemote[];
  remoteState: GitRemoteState;
  trackingBranches: Record<string, string>;
}

export interface GitCommandResult {
  success: boolean;
  output: string;
  state: GitState;
  action?: GitAction;
}

export type GitAction =
  | 'init'
  | 'add'
  | 'commit'
  | 'branch-create'
  | 'branch-list'
  | 'checkout'
  | 'merge'
  | 'merge-fast-forward'
  | 'rebase'
  | 'reset-soft'
  | 'reset-mixed'
  | 'reset-hard'
  | 'stash-push'
  | 'stash-pop'
  | 'cherry-pick'
  | 'tag'
  | 'log'
  | 'status'
  | 'diff'
  | 'push'
  | 'pull'
  | 'fetch'
  | 'clone'
  | 'revert'
  | 'remote'
  | 'error';

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info' | 'hint';
  text: string;
}

export interface CommitNode {
  id: string;
  x: number;
  y: number;
  commit: GitCommit;
  column: number;
}

export interface BranchLabel {
  name: string;
  commitId: string;
  isHead: boolean;
  color: string;
}

export type GitMode = 'guided' | 'freeplay';

export interface GuidedStep {
  instruction: string;
  expectedCommand: string | RegExp;
  hint: string;
  explanation: string;
}

export interface GuidedLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: GuidedStep[];
}
