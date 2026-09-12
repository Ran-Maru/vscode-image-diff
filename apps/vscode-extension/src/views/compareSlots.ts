import * as vscode from 'vscode';

export class CompareSlots {
  before?: vscode.Uri;
  after?: vscode.Uri;

  private readonly emitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.emitter.event;

  setBefore(uri: vscode.Uri): void {
    this.before = uri;
    this.emitter.fire();
  }

  setAfter(uri: vscode.Uri): void {
    this.after = uri;
    this.emitter.fire();
  }

  snapshot(): { before?: string; after?: string } {
    return {
      before: this.before?.fsPath,
      after: this.after?.fsPath,
    };
  }
}
