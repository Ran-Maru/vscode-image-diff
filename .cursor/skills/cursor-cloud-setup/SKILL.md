---
name: cursor-cloud-setup
description: >-
  Documents Cloud Agent git commit hooks that strip personal email from
  Co-authored-by and split commit from push. Use when configuring Cloud Agent
  commits, Co-authored-by trailers, or git commit && git push.
---

# Cursor Cloud setup

## Cloud Agent のコミットメール

Cursor アカウントの個人メールが `Co-authored-by` に付くのを防ぐ公式設定は無い。
`.cursor/hooks.json` の `afterShellExecution` が、ホスト型 Cloud Agent（`/run/cursor/api.sock` があるとき）の `git commit` 直後だけメッセージを直す。
同じコマンドで `git commit` と `git push` をつなぐと、その前に `beforeShellExecution` が拒否する。ローカルではどちらも動かない。
