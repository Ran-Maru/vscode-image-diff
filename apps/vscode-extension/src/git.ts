import * as vscode from 'vscode';
import type { Change, GitExtension, Repository } from './gitTypes';
import { Status } from './status';
import { isImageUri, toGitUri } from './uris';

export interface ImageChangePair {
  original?: vscode.Uri;
  modified?: vscode.Uri;
  uri: vscode.Uri;
  status: Status;
  label: string;
}

export async function getGitAPI() {
  const extension = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!extension) {
    return undefined;
  }
  const exports = extension.isActive ? extension.exports : await extension.activate();
  return exports.getAPI(1);
}

export function pairForChange(change: Change): ImageChangePair {
  const status = change.status;
  if (isAdded(status)) {
    return {
      modified: change.uri,
      uri: change.uri,
      status,
      label: statusLabel(status),
    };
  }
  if (status === Status.INDEX_DELETED) {
    return {
      original: toGitUri(change.originalUri ?? change.uri, 'HEAD'),
      uri: change.uri,
      status,
      label: statusLabel(status),
    };
  }
  if (status === Status.DELETED) {
    return {
      original: toGitUri(change.originalUri ?? change.uri, '~'),
      uri: change.uri,
      status,
      label: statusLabel(status),
    };
  }
  if (isIndexChange(status)) {
    return {
      original: toGitUri(change.originalUri ?? change.uri, 'HEAD'),
      modified: toGitUri(change.uri, ''),
      uri: change.uri,
      status,
      label: statusLabel(status),
    };
  }
  return {
    original: toGitUri(change.originalUri ?? change.uri, '~'),
    modified: change.uri,
    uri: change.uri,
    status,
    label: statusLabel(status),
  };
}

export function imageChanges(repository: Repository): {
  staged: ImageChangePair[];
  working: ImageChangePair[];
} {
  return {
    staged: repository.state.indexChanges.filter((c) => isImageUri(c.uri)).map(pairForChange),
    working: repository.state.workingTreeChanges
      .filter((c) => isImageUri(c.uri))
      .map(pairForChange),
  };
}

function isIndexChange(status: Status): boolean {
  return (
    status === Status.INDEX_MODIFIED ||
    status === Status.INDEX_ADDED ||
    status === Status.INDEX_DELETED ||
    status === Status.INDEX_RENAMED ||
    status === Status.INDEX_COPIED
  );
}

function isAdded(status: Status): boolean {
  return (
    status === Status.INDEX_ADDED || status === Status.UNTRACKED || status === Status.INTENT_TO_ADD
  );
}

function statusLabel(status: Status): string {
  switch (status) {
    case Status.INDEX_ADDED:
    case Status.UNTRACKED:
    case Status.INTENT_TO_ADD:
      return 'A';
    case Status.INDEX_DELETED:
    case Status.DELETED:
      return 'D';
    case Status.INDEX_RENAMED:
    case Status.INTENT_TO_RENAME:
      return 'R';
    default:
      return 'M';
  }
}
