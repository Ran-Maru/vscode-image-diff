import * as vscode from 'vscode';
import { isImageUri } from '../uris';
import type { CompareSlots } from './compareSlots';

export class CompareViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'imageDiff.compare';
  private view?: vscode.WebviewView;

  constructor(private readonly slots: CompareSlots) {
    this.slots.onDidChange(() => this.postState());
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.html(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(
      (message: { type: string; slot?: string; uri?: string }) => {
        void this.onMessage(message);
      },
    );
    this.postState();
  }

  private postState(): void {
    void this.view?.webview.postMessage({ type: 'state', ...this.slots.snapshot() });
  }

  private async onMessage(message: { type: string; slot?: string; uri?: string }): Promise<void> {
    if (message.type === 'pick') {
      const uri = await pickImage();
      if (!uri) {
        return;
      }
      if (message.slot === 'before') {
        this.slots.setBefore(uri);
      } else {
        this.slots.setAfter(uri);
      }
      return;
    }

    if (message.type === 'drop' && message.uri && message.slot) {
      const uri = vscode.Uri.parse(message.uri);
      if (!isImageUri(uri)) {
        void vscode.window.showWarningMessage('Image Diff supports PNG, JPG, GIF, and SVG.');
        return;
      }
      if (message.slot === 'before') {
        this.slots.setBefore(uri);
      } else {
        this.slots.setAfter(uri);
      }
      return;
    }

    if (message.type === 'compare') {
      await vscode.commands.executeCommand(
        'imageDiff.openUris',
        this.slots.before,
        this.slots.after,
      );
    }
  }

  private html(webview: vscode.Webview): string {
    const nonce = [...crypto.getRandomValues(new Uint8Array(16))]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <style>
      :root { color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
      body { margin: 12px; }
      .slot { border: 1px dashed var(--vscode-panel-border); border-radius: 6px; padding: 10px; margin-bottom: 10px; }
      .slot h3 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; opacity: 0.7; }
      .path { word-break: break-all; margin-bottom: 8px; min-height: 2.4em; opacity: 0.85; }
      button { width: 100%; margin-top: 6px; }
      .hint { opacity: 0.7; font-size: 12px; margin: 0 0 12px; }
    </style>
  </head>
  <body>
    <p class="hint">Pick two local images, drop them here, or use the Explorer context menu.</p>
    <div class="slot" data-slot="before">
      <h3>Before</h3>
      <div class="path" id="before">Not set</div>
      <button id="pickBefore">Choose file</button>
    </div>
    <div class="slot" data-slot="after">
      <h3>After</h3>
      <div class="path" id="after">Not set</div>
      <button id="pickAfter">Choose file</button>
    </div>
    <button id="compare">Compare</button>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const beforeEl = document.getElementById('before');
      const afterEl = document.getElementById('after');
      document.getElementById('pickBefore').addEventListener('click', () => vscode.postMessage({ type: 'pick', slot: 'before' }));
      document.getElementById('pickAfter').addEventListener('click', () => vscode.postMessage({ type: 'pick', slot: 'after' }));
      document.getElementById('compare').addEventListener('click', () => vscode.postMessage({ type: 'compare' }));
      window.addEventListener('message', (event) => {
        if (event.data.type !== 'state') return;
        beforeEl.textContent = event.data.before || 'Not set';
        afterEl.textContent = event.data.after || 'Not set';
      });
      document.querySelectorAll('.slot').forEach((slot) => {
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text');
          if (uri) vscode.postMessage({ type: 'drop', slot: slot.dataset.slot, uri: uri.split('\\n')[0] });
        });
      });
    </script>
  </body>
</html>`;
  }
}

async function pickImage(): Promise<vscode.Uri | undefined> {
  const picked = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { Images: ['png', 'jpg', 'jpeg', 'gif', 'svg'] },
  });
  return picked?.[0];
}
