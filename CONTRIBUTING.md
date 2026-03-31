# Contributing to json-builder

開発への参加ありがとうございます！

## 開発環境のセットアップ

```bash
git clone https://github.com/your-org/json-builder.git
cd json-builder
npm install
npm run dev
```

## ブランチ戦略

- `main` — 安定版
- `feature/*` — 新機能
- `fix/*` — バグ修正

## コミットメッセージ

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更（機能変更なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・ツール設定変更
```

## テスト実行

```bash
npm test           # ユニットテスト
npm run test:ui    # テスト UI
```

## コードスタイル

- TypeScript strict モード
- ESLint でリント
- CSS Modules でスタイル管理

## Pull Request

1. フォークまたはブランチを作成
2. 変更を加えてテストが通ることを確認
3. PR を作成（`main` ブランチへ）
