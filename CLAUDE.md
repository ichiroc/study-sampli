# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「スタディサンプリング」は、勉強中に正解したときに正解音を鳴らしてカウントするジョーク PWA アプリ。

## アーキテクチャ

ビルドステップなし。すべて `index.html` 1ファイルに集約されたシンプルな静的サイト。

- **フレームワーク**: Hotwire Stimulus（CDN経由）
- **スタイル**: Tailwind CSS（CDN経由）
- **データ永続化**: localStorage
- **PWA**: `sw.js`（Service Worker）+ `manifest.json`

### Stimulus コントローラー（index.html 内に実装）

| コントローラー | 役割 |
|---|---|
| `CountController` | 正解カウント・連続日数・目標管理 |
| `SoundController` | 正解音再生（`correct.mp3`） |
| `WakeLockController` | スリープ防止（Wake Lock API） |

### localStorage キー

- `studySampli`: `{ "YYYY-MM-DD": count }` 形式の日別カウント
- `studySampli_goal`: 1日の目標問題数

## 開発・動作確認

ビルド不要。ローカルサーバーを立ち上げてブラウザで確認する。

```bash
# Python の場合
python3 -m http.server 8080

# Node.js の場合
npx serve .
```

Service Worker のキャッシュが効くため、変更を確認する際はブラウザの「ハードリロード」またはキャッシュ無効化が必要。

## iOS 対応の注意点

- キーボード入力（a/b キー）はフォーカス可能な `<input>` 要素（`keyCapture`）を `touchend` で focus させることで対応
- ズーム防止のため `maximum-scale=1.0` を設定
- セーフエリア対応のため `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` を使用
