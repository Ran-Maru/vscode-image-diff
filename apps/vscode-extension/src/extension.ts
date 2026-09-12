import * as vscode from 'vscode';
import { ImageDiffPanel } from './ImageDiffPanel';
import { ScmTabTakeover } from './scmTabTakeover';
import { isImageUri } from './uris';
import { ChangesTreeProvider } from './views/changesTree';
import { CompareSlots } from './views/compareSlots';
import { CompareViewProvider } from './views/compareView';

export function activate(context: vscode.ExtensionContext): void {
  const takeover = new ScmTabTakeover(context);
  const slots = new CompareSlots();
  const changes = new ChangesTreeProvider();

  context.subscriptions.push(
    takeover.register(),
    vscode.window.registerTreeDataProvider('imageDiff.changes', changes),
    vscode.window.registerWebviewViewProvider(
      CompareViewProvider.viewType,
      new CompareViewProvider(slots),
    ),
    vscode.commands.registerCommand(
      'imageDiff.openUris',
      async (original?: vscode.Uri, modified?: vscode.Uri) => {
        if (!original && !modified) {
          return;
        }
        await ImageDiffPanel.show(context, original, modified);
      },
    ),
    vscode.commands.registerCommand('imageDiff.openFromDiff', async () => {
      const tab = takeover.findActiveDiffTab();
      if (!tab || !(tab.input instanceof vscode.TabInputTextDiff)) {
        void vscode.window.showInformationMessage('Open an image diff tab first.');
        return;
      }
      const { original, modified } = tab.input;
      takeover.unsuppress(original, modified);
      await ImageDiffPanel.show(context, original, modified, tab.group.viewColumn);
      await vscode.window.tabGroups.close(tab, true);
    }),
    vscode.commands.registerCommand('imageDiff.openStandardDiff', async () => {
      const panel = ImageDiffPanel.current;
      if (!panel?.original && !panel?.modified) {
        return;
      }
      const original = panel.original;
      const modified = panel.modified;
      takeover.suppress(original, modified);
      const title = 'Image Diff (standard)';
      if (original && modified) {
        await vscode.commands.executeCommand('vscode.diff', original, modified, title);
      } else {
        await vscode.commands.executeCommand('vscode.open', modified ?? original);
      }
    }),
    vscode.commands.registerCommand('imageDiff.setCompareA', (uri?: vscode.Uri) => {
      const target = uri ?? vscode.window.activeTextEditor?.document.uri;
      if (target && isImageUri(target)) {
        slots.setBefore(target);
      }
    }),
    vscode.commands.registerCommand('imageDiff.setCompareB', (uri?: vscode.Uri) => {
      const target = uri ?? vscode.window.activeTextEditor?.document.uri;
      if (target && isImageUri(target)) {
        slots.setAfter(target);
      }
    }),
    vscode.commands.registerCommand(
      'imageDiff.compareSelected',
      async (uri?: vscode.Uri, selected?: vscode.Uri[]) => {
        const images = (selected?.length ? selected : uri ? [uri] : []).filter(isImageUri);
        if (images.length < 2) {
          void vscode.window.showInformationMessage('Select two image files to compare.');
          return;
        }
        slots.setBefore(images[0]!);
        slots.setAfter(images[1]!);
        await ImageDiffPanel.show(context, images[0], images[1]);
      },
    ),
    vscode.commands.registerCommand('imageDiff.refreshChanges', () => changes.refresh()),
  );
}

export function deactivate(): void {
  ImageDiffPanel.current?.dispose();
}
