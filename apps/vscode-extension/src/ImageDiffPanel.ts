import { mimeFromPath } from '@image-diff/viewer/formats';
import * as vscode from 'vscode';
import { basename } from './uris';

export interface ImagePayload {
  name: string;
  byteSize: number;
  mime: string;
  bytes: Uint8Array;
}

export class ImageDiffPanel {
  public static current: ImageDiffPanel | undefined;
  public static readonly viewType = 'imageDiff.viewer';

  public original?: vscode.Uri;
  public modified?: vscode.Uri;

  private readonly disposables: vscode.Disposable[] = [];
  private fileWatcher: vscode.Disposable | undefined;

  private constructor(
    private readonly context: vscode.ExtensionContext,
    public readonly panel: vscode.WebviewPanel,
  ) {
    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  static async show(
    context: vscode.ExtensionContext,
    original?: vscode.Uri,
    modified?: vscode.Uri,
    column?: vscode.ViewColumn,
  ): Promise<ImageDiffPanel> {
    const targetColumn = column ?? vscode.ViewColumn.Active;
    if (ImageDiffPanel.current) {
      ImageDiffPanel.current.panel.reveal(targetColumn);
      await ImageDiffPanel.current.load(original, modified);
      return ImageDiffPanel.current;
    }

    const panel = vscode.window.createWebviewPanel(
      ImageDiffPanel.viewType,
      'Image Diff',
      targetColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview')],
      },
    );

    const instance = new ImageDiffPanel(context, panel);
    ImageDiffPanel.current = instance;
    await instance.load(original, modified);
    return instance;
  }

  async load(original?: vscode.Uri, modified?: vscode.Uri): Promise<void> {
    this.original = original;
    this.modified = modified;
    this.watchWorkingCopy();

    const config = vscode.workspace.getConfiguration('imageDiff');
    const [before, after] = await Promise.all([readPayload(original), readPayload(modified)]);
    const titleSource = modified ?? original;
    this.panel.title = titleSource ? `${basename(titleSource.path)} — Image Diff` : 'Image Diff';

    await this.panel.webview.postMessage({
      type: 'setState',
      before,
      after,
      mode: config.get('defaultMode', '2-up'),
      background: config.get('background', 'checkerboard'),
    });
  }

  dispose(): void {
    ImageDiffPanel.current = undefined;
    this.fileWatcher?.dispose();
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }

  private watchWorkingCopy(): void {
    this.fileWatcher?.dispose();
    this.fileWatcher = undefined;
    const fileUri = [this.modified, this.original].find((uri) => uri?.scheme === 'file');
    if (!fileUri) {
      return;
    }
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.Uri.joinPath(fileUri, '..'), basename(fileUri.path)),
    );
    const reload = () => {
      void this.load(this.original, this.modified);
    };
    watcher.onDidChange(reload);
    watcher.onDidCreate(reload);
    this.fileWatcher = watcher;
  }

  private getHtml(): string {
    const webview = this.panel.webview;
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.js'),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.css'),
    );

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${styleUri}" />
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }
}

async function readPayload(uri?: vscode.Uri): Promise<ImagePayload | undefined> {
  if (!uri) {
    return undefined;
  }
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return {
      name: basename(uri.path),
      byteSize: bytes.byteLength,
      mime: mimeFromPath(uri.path),
      bytes,
    };
  } catch {
    return undefined;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i += 1) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
