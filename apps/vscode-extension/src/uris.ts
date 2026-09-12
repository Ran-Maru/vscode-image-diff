import { extname, isSupportedImagePath } from '@image-diff/viewer/formats';
import * as vscode from 'vscode';

export function basename(path: string): string {
  const slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return slash >= 0 ? path.slice(slash + 1) : path;
}

export function getSupportedExtensions(): string[] {
  const configured = vscode.workspace
    .getConfiguration('imageDiff')
    .get<string[]>('supportedExtensions');
  return (configured ?? ['.png', '.jpg', '.jpeg', '.gif', '.svg']).map((ext) =>
    ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
  );
}

export function isImageUri(uri: vscode.Uri | undefined): boolean {
  if (!uri) {
    return false;
  }
  return isSupportedImagePath(uri.path, getSupportedExtensions());
}

export function isImagePath(path: string): boolean {
  return isSupportedImagePath(path, getSupportedExtensions());
}

export function pairKey(original?: vscode.Uri, modified?: vscode.Uri): string {
  return `${original?.toString() ?? ''}||${modified?.toString() ?? ''}`;
}

export function toGitUri(uri: vscode.Uri, ref: string): vscode.Uri {
  return uri.with({
    scheme: 'git',
    query: JSON.stringify({ path: uri.fsPath, ref }),
  });
}

export function extOf(uri: vscode.Uri): string {
  return extname(uri.path);
}
