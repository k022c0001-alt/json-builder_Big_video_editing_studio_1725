# json-builder

**マークダウンメモから JSON を生成するデスクトップアプリ**

マークダウン形式でメモを書くだけで、リアルタイムに JSON が生成されます。  
Electron + React + TypeScript で構築された VS Code ライクな編集環境です。

---

## 📸 概要

```
┌─────────────────────────────────────────────┐
│  📁 File  [●Tab1] [Tab2] [+]    ☀️🌙🌈🌌📚 ⚙️ │
├──────────────────┬──────────────────────────┤
│  # My Project    │  📥 Save   📋 Copy        │
│  ## Settings     │                           │
│  - theme: dark   │  {                        │
│  - fps: 60       │    "name": "My Project",  │
│                  │    "Settings": {          │
│  Error Panel     │      "theme": "dark",     │
└──────────────────┴──────────────────────────┘
```

---

## ✨ 機能

- **リアルタイムプレビュー** — 300ms デバウンスでメモをパース
- **ファイル管理** — Open / Save / Save As（Ctrl+O/S）
- **5つのテーマ** — ☀️Light / 🌙Dark / 🌈Rainbow / 🌌Space / 📚Classroom
- **複数タブ** — 複数プロジェクトを同時編集、ドラッグでタブ並び替え
- **エラーパネル** — パースエラーと修正提案をリアルタイム表示
- **JSON エクスポート** — ファイル保存 / クリップボードコピー
- **設定パネル** — テーマ・言語・フォントサイズ・自動保存

---

## 🚀 インストール・起動

### 前提条件

- Node.js 18 以上
- npm 9 以上

### セットアップ

```bash
git clone https://github.com/your-org/json-builder.git
cd json-builder
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

Electron アプリが自動起動します（Vite dev server: `http://localhost:5173`）。

### ビルド

```bash
npm run build        # renderer + electron 両方ビルド
npm run build:renderer  # Vite のみ
npm run build:electron  # Electron のみ
```

---

## 📝 メモフォーマット仕様

### 基本構造

```markdown
# プロジェクト名

## セクション名
- キー: 値
- フラグ

### サブセクション名
- ネストされたキー: 値
```

### 生成される JSON

```json
{
  "name": "プロジェクト名",
  "セクション名": {
    "キー": "値",
    "フラグ": true,
    "サブセクション名": {
      "ネストされたキー": "値"
    }
  }
}
```

### 値の型変換

| メモ記法 | JSON 型 | 例 |
|---------|--------|-----|
| `- key: hello` | 文字列 | `"hello"` |
| `- key: 42` | 数値 | `42` |
| `- key: 3.14` | 数値 | `3.14` |
| `- key: true` | 真偽値 | `true` |
| `- key: false` | 真偽値 | `false` |
| `- key: null` | null | `null` |
| `- key: [a, b, c]` | 配列 | `["a", "b", "c"]` |
| `- flag` | 真偽値（true） | `true` |

### インライン JSON コードブロック

````markdown
## Meta
```json
{
  "version": 2,
  "build": "release"
}
```
````

→ `Meta` セクションに直接マージされます。

---

## ⌨️ キーボードショートカット

| ショートカット | 機能 |
|--------------|------|
| `Ctrl+O` | ファイルを開く |
| `Ctrl+S` | 保存 |
| `Ctrl+Shift+S` | 名前をつけて保存 |

---

## 🎨 テーマ

| アイコン | テーマ名 | 説明 |
|--------|---------|------|
| ☀️ | Light | 明るいデフォルトテーマ |
| 🌙 | Dark | VS Code ライクなダークテーマ |
| 🌈 | Rainbow | 虹色グラデーション |
| 🌌 | Space | ネオンカラーの宇宙テーマ |
| 📚 | Classroom | 黒板とチョークの教室テーマ |

テーマはブラウザの localStorage に保存され、次回起動時も引き継がれます。

---

## 🧪 テスト

```bash
npm test          # ユニットテスト（vitest）
npm run test:ui   # テスト UI
```

---

## 📁 プロジェクト構造

```
json-builder/
├── electron/            # Electron メインプロセス
│   ├── main.ts          # アプリエントリポイント
│   ├── preload.ts       # contextBridge (IPC)
│   └── ipc-handlers.ts  # IPC ハンドラー
├── shared/              # main/renderer 共有コード
│   ├── parser/          # マークダウン → JSON パーサー
│   └── store/           # Zustand ストア
├── src/                 # React フロントエンド
│   ├── components/      # UI コンポーネント
│   ├── hooks/           # カスタムフック
│   ├── services/        # ファイル管理・設定
│   ├── styles/          # CSS モジュール
│   └── theme/           # テーマ定義
└── examples/            # サンプルメモファイル
```

---

## 📄 ライセンス

MIT