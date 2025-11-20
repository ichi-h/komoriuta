# Task Completion Checklist

タスク完了時に実行すべき項目

## コード品質チェック

### Manager (TypeScript/Bun)

```bash
cd bun

# リンティング
biome check .

# フォーマット
biome format .

# テスト実行（もし存在する場合）
bun test

# ビルド確認
bun run build
```

### Agent (Go)

```bash
cd go

# フォーマット
go fmt ./...

# リンティング
go vet ./...

# テスト実行
go test ./...

# ビルド確認
go build
```

## Protocol Buffers

```bash
# スキーマ変更がある場合、コード生成を実行
buf generate
```

## ドキュメント更新

- 重要な変更がある場合、該当するドキュメントを更新
  - `/docs/prd.md` (Product Requirements Document)
  - `/docs/srs.md` (Software Requirements Specification)
  - `/docs/sdd.md` (System Design Document)

## セキュリティチェック

- 機密情報（トークン、パスワード等）がコードやログに露出していないか確認
- ログに機密情報が含まれる場合は適切にマスク処理されているか確認

## コミット前の確認

- [ ] リンティング・フォーマットを実行
- [ ] テストが通過
- [ ] ビルドが成功
- [ ] 変更内容を説明するコミットメッセージを作成

## 本番環境デプロイ前（該当する場合）

- [ ] コンテナイメージのビルド確認
- [ ] 環境変数の設定確認
- [ ] データベースマイグレーション（必要な場合）
- [ ] ログローテーション設定の確認
- [ ] セキュリティ設定の確認（HTTPS、認証、CORS 等）
