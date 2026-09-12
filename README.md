# Image Diff

GitHub の Pull Request と同じ 2-up / Swipe / Onion Skin で画像を比較するツールです。

- **VS Code 拡張**: Source Control の画像差分を差し替え、Activity Bar からも比較できます
- **Web アプリ**: 画像はサーバーに送らず、ブラウザ内だけで処理します

対応形式: **PNG / JPG / JPEG / SVG / GIF**

## Web アプリ

GitHub Pages にデプロイした SPA です。Before / After に画像をドロップするか、ファイル選択・クリップボード貼り付けで比較します。

本番ビルドでは `connect-src 'none'` の CSP を入れて、ネットワーク送信できないようにしています。

ローカル実行:

```bash
pnpm install
pnpm --filter @image-diff/web dev
```

## VS Code 拡張

### Source Control

Changes から画像を開くと、標準の画像 diff タブを Image Diff ビューアーに置き換えます。タイトルバーの **Open Standard Diff** (`$(diff)`) で VS Code 標準の差分に戻せます。標準 diff からは **Open Image Diff** (`$(compare-changes)`) で戻ります。

自動差し替えは設定 `imageDiff.autoOpenFromScm` でオフにできます。

### Activity Bar

Image Diff コンテナに 2 つのビューがあります。

- **Changed Images**: 作業ツリー / ステージ済みの画像変更を列挙し、クリックで比較
- **Compare**: 任意の 2 ファイルを Before / After に指定して比較（ファイル選択、ドロップ、エクスプローラーのコンテキストメニュー）

### 設定

| 設定                            | 既定値                      | 説明                                 |
| ------------------------------- | --------------------------- | ------------------------------------ |
| `imageDiff.autoOpenFromScm`     | `true`                      | SCM の画像 diff を自動で差し替える   |
| `imageDiff.defaultMode`         | `2-up`                      | 初期比較モード                       |
| `imageDiff.background`          | `checkerboard`              | 背景（checkerboard / white / black） |
| `imageDiff.supportedExtensions` | `.png .jpg .jpeg .gif .svg` | 対象拡張子                           |

拡張のビルド:

```bash
pnpm --filter image-diff build
```

`apps/vscode-extension` を「拡張機能のデバッグ」で起動してください。

## 比較モード

- **2-up**: 左右に並べ、ズーム / パンを共有
- **Swipe**: 重ねた 2 枚をハンドルで左右にクリップ（矢印キーでも操作）
- **Onion Skin**: After の不透明度をスライダーで変更

寸法が違う場合は GitHub と同じく `max(幅) × max(高さ)` のボックスに左上揃えで重ねます。

## 既知の制約

- **GIF**: `<img>` で再生するためアニメーションは維持されますが、2 枚のフレーム位置は同期しません。Swipe / Onion Skin では再生位置がずれることがあります。
- VS Code の単一 webview による custom diff API はまだ proposed のため、Marketplace 公開可能な安定 API だけで SCM タブを差し替えています。

## 開発

pnpm workspaces のモノレポです。

```
packages/viewer   共通ビューアー（React）
apps/web          GitHub Pages 用 SPA
apps/vscode-extension
```

```bash
pnpm install
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```
