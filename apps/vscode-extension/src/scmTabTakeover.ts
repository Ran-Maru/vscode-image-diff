import * as vscode from 'vscode';
import { ImageDiffPanel } from './ImageDiffPanel';
import { isImageUri, pairKey } from './uris';

export class ScmTabTakeover {
  private readonly suppressed = new Set<string>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  register(): vscode.Disposable {
    return vscode.window.tabGroups.onDidChangeTabs((event) => {
      for (const tab of event.opened) {
        void this.maybeTakeOver(tab);
      }
    });
  }

  suppress(original?: vscode.Uri, modified?: vscode.Uri): void {
    this.suppressed.add(pairKey(original, modified));
  }

  unsuppress(original?: vscode.Uri, modified?: vscode.Uri): void {
    this.suppressed.delete(pairKey(original, modified));
  }

  findActiveDiffTab(): vscode.Tab | undefined {
    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.isActive && tab.input instanceof vscode.TabInputTextDiff) {
          return tab;
        }
      }
    }
    return undefined;
  }

  private async maybeTakeOver(tab: vscode.Tab): Promise<void> {
    if (!(tab.input instanceof vscode.TabInputTextDiff)) {
      return;
    }
    const { original, modified } = tab.input;
    if (!isImageUri(original) && !isImageUri(modified)) {
      return;
    }
    const autoOpen = vscode.workspace
      .getConfiguration('imageDiff')
      .get<boolean>('autoOpenFromScm', true);
    if (!autoOpen) {
      return;
    }
    if (this.suppressed.has(pairKey(original, modified))) {
      return;
    }

    const column = tab.group.viewColumn;
    await ImageDiffPanel.show(this.context, original, modified, column);
    await vscode.window.tabGroups.close(tab, true);
  }
}
