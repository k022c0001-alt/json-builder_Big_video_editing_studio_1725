# Architecture

## 概要

json-builder は Electron + React + TypeScript で構築されています。

```
┌─────────────────────────────────────────────┐
│               Electron (Main Process)        │
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │ main.ts  │  │   ipc-handlers.ts        │ │
│  │          │  │  - save-json-file        │ │
│  │          │  │  - save-json-file-as     │ │
│  │          │  │  - open-file             │ │
│  │          │  │  - copy-to-clipboard     │ │
│  └────┬─────┘  └────────────┬─────────────┘ │
│       │ createWindow         │ IPC           │
└───────┼──────────────────────┼───────────────┘
        │ preload.js (bridge)  │
┌───────┼──────────────────────┼───────────────┐
│       ▼    React Renderer     ▼               │
│  ┌──────────────────────────────────────┐    │
│  │            EditorLayout              │    │
│  │  Toolbar: FileMenu | Tabs | Theme    │    │
│  │  ┌─────────────┬────────────────┐   │    │
│  │  │  MemoInput  │   JsonPreview  │   │    │
│  │  │  (textarea) │   (tree view)  │   │    │
│  │  └─────────────┴────────────────┘   │    │
│  │          ErrorPanel                  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## データフロー

```
MemoInput (textarea)
    │ onChange (300ms debounce)
    ▼
useRealtimeParse (hook)
    │ parseMemoToProject()
    ▼
Zustand Store (project, memoText, parserErrors)
    │
    ├──► JsonPreview → JsonTreeView (render)
    └──► ErrorPanel (render errors)
```

## 主要モジュール

### shared/parser/memoParser.ts
マークダウン → JSON 変換ロジック。副作用なし・純粋関数。

### shared/store/project.store.ts
Zustand ストア。`project`, `memoText`, `parserErrors` を管理。

### src/hooks/useRealtimeParse.ts
テキスト変更を debounce してパースし、ストアを更新。

### src/hooks/useTheme.ts
テーマ状態管理。LocalStorage で永続化。CSS変数をDOMに適用。

### src/hooks/useProjectTabs.ts
複数タブ（ProjectTab[]）の状態管理。ドラッグ並び替え対応。

### src/services/fileManager.ts
ファイル操作の抽象化レイヤー。Electron IPC と ブラウザ fallback を統合。

### src/services/settingsManager.ts
アプリ設定（言語・フォントサイズ・自動保存）の永続化。

### src/theme/themes.ts
5テーマのカラーパレット定義と `applyTheme()` 関数。

## テーマシステム

1. `useTheme()` が localStorage からテーマを読み込む
2. `applyTheme(theme)` が CSS Custom Properties を `document.documentElement` に設定
3. `data-theme` 属性でテーマクラスを切り替え
4. CSS transitions でスムーズな切り替えアニメーション

## タブシステム

- `TabContextProvider` が全タブ状態を React Context で提供
- 各タブは独立した `ProjectTab`（project + memoText + isDirty）を持つ
- `useProjectStore`（Zustand）はアクティブタブのデータのみ保持

## Electron IPC

| Channel | 方向 | 説明 |
|---------|------|------|
| `save-json-file` | renderer → main | 保存ダイアログ |
| `save-json-file-as` | renderer → main | 名前をつけて保存 |
| `open-file` | renderer → main | 開くダイアログ |
| `copy-to-clipboard` | renderer → main | クリップボード |
| `get-recent-files` | renderer → main | 最近のファイル |
