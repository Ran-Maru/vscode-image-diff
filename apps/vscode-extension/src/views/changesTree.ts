import * as path from 'node:path';
import * as vscode from 'vscode';
import { getGitAPI, imageChanges, type ImageChangePair } from '../git';
import type { API, Repository } from '../gitTypes';
import { basename } from '../uris';

type TreeNode = RepoNode | GroupNode | ChangeNode;

interface RepoNode {
  kind: 'repo';
  repository: Repository;
}

interface GroupNode {
  kind: 'group';
  repository: Repository;
  label: 'Staged' | 'Changes';
  items: ImageChangePair[];
}

interface ChangeNode {
  kind: 'change';
  item: ImageChangePair;
}

export class ChangesTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly emitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.emitter.event;
  private api: API | undefined;
  private readonly repoListeners: vscode.Disposable[] = [];

  constructor() {
    void this.bindGit();
  }

  refresh(): void {
    this.emitter.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    if (element.kind === 'repo') {
      const item = new vscode.TreeItem(
        path.basename(element.repository.rootUri.fsPath),
        vscode.TreeItemCollapsibleState.Expanded,
      );
      item.contextValue = 'imageDiff.repo';
      item.iconPath = new vscode.ThemeIcon('repo');
      return item;
    }
    if (element.kind === 'group') {
      const item = new vscode.TreeItem(
        `${element.label} (${element.items.length})`,
        vscode.TreeItemCollapsibleState.Expanded,
      );
      item.contextValue = 'imageDiff.group';
      return item;
    }

    const item = new vscode.TreeItem(basename(element.item.uri.path));
    item.description = element.item.label;
    item.resourceUri = element.item.uri;
    item.command = {
      command: 'imageDiff.openUris',
      title: 'Open Image Diff',
      arguments: [element.item.original, element.item.modified],
    };
    item.iconPath = new vscode.ThemeIcon('file-media');
    item.tooltip = element.item.uri.fsPath;
    return item;
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    const api = this.api ?? (await getGitAPI());
    this.api = api;
    if (!api) {
      return [];
    }

    if (!element) {
      const repos = api.repositories.filter((repo) => {
        const { staged, working } = imageChanges(repo);
        return staged.length + working.length > 0;
      });
      if (repos.length === 1 && repos[0]) {
        return this.groupsFor(repos[0]);
      }
      return repos.map((repository) => ({ kind: 'repo', repository }));
    }

    if (element.kind === 'repo') {
      return this.groupsFor(element.repository);
    }
    if (element.kind === 'group') {
      return element.items.map((item) => ({ kind: 'change', item }));
    }
    return [];
  }

  private groupsFor(repository: Repository): GroupNode[] {
    const { staged, working } = imageChanges(repository);
    const groups: GroupNode[] = [];
    if (staged.length) {
      groups.push({ kind: 'group', repository, label: 'Staged', items: staged });
    }
    if (working.length) {
      groups.push({ kind: 'group', repository, label: 'Changes', items: working });
    }
    return groups;
  }

  private async bindGit(): Promise<void> {
    const api = await getGitAPI();
    this.api = api;
    if (!api) {
      return;
    }
    const bindRepo = (repository: Repository) => {
      this.repoListeners.push(repository.state.onDidChange(() => this.refresh()));
    };
    api.repositories.forEach(bindRepo);
    api.onDidOpenRepository((repo) => {
      bindRepo(repo);
      this.refresh();
    });
    api.onDidCloseRepository(() => this.refresh());
  }
}
