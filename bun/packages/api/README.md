# komo-api

Komoriuta のバックエンド API サーバー。

詳細なアーキテクチャやシステム設計については、[プロジェクトドキュメント](/docs)を参照してください。

ディレクトリ構成については、[ARCHITECTURE.md](./ARCHITECTURE.md)を参照してください。

## 開発

### 前提条件

- Bun
- Nix (開発環境)

### セットアップ

```bash
# プロジェクトのルートで依存関係をインストール
bun install

# パッケージディレクトリに移動
cd bun/packages/api
bun install

# 環境変数ファイルを作成（オプション）
cp .env.example .env
# .envファイルを編集して必要な設定を行う
```

### 開発サーバー起動

```bash
bun run dev
```

### ビルド

```bash
bun run build
```

このコマンドは以下を実行します：

1. TypeScript をコンパイル
2. 単一実行ファイル `bin/komo-api` を生成

### 実行

```bash
bun run start
# または
./bin/komo-api
```

### データベースのシード

開発・テスト用のサンプルデータを投入する場合:

```bash
bun run seed
```

このコマンドは以下のサンプルデータを作成します:

- 3 台のサーバー（Development Server, Test Server, Staging Server）
- 各サーバーのアクセストークン

**注意**: 既にデータが存在する場合、シードはスキップされます。

## 環境変数

### 環境変数ファイルの設定

開発環境では、`.env.example`をコピーして`.env`ファイルを作成できます：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、必要な環境変数を設定してください。

**重要**: 本番環境では以下の環境変数を必ず設定してください:

- `PASSWORD_HASH`: 管理者パスワードの scrypt ハッシュ
- `COOKIE_SECRET`: Cookie 署名用のランダムな文字列

### 環境変数一覧

| 変数名                     | 説明                                             | デフォルト値              |
| -------------------------- | ------------------------------------------------ | ------------------------- |
| `PORT`                     | API サーバーのポート                             | 3001                      |
| `HOST`                     | API サーバーのホスト                             | 127.0.0.1                 |
| `DB_PATH`                  | SQLite データベースのパス                        | ./data/komoriuta.db       |
| `USER_ID`                  | 管理者ユーザー ID                                | admin                     |
| `PASSWORD_HASH`            | 管理者パスワード(scrypt ハッシュ)                | -                         |
| `SESSION_MAX_AGE`          | セッション有効期限（秒）                         | 86400                     |
| `TOKEN_EXPIRES_SECONDS`    | アクセストークン有効期限（秒）、0 で無期限       | 7776000                   |
| `ALLOWED_ORIGIN`           | CORS 許可オリジン                                | http://localhost:3000     |
| `COOKIE_SECRET`            | Cookie 署名用シークレット                        | -                         |
| `LOG_FILE_PATH`            | ログファイル出力先パス（相対パスまたは絶対パス） | ./logs/komo-api.log.jsonl |
| `DISABLE_FILE_LOG`         | ファイルログを無効化（true/false）               | false                     |
| `LOG_ROTATION_GENERATIONS` | ログローテーション世代数                         | 7                         |

詳細な機能説明、データベース設計、セキュリティ設計については、[プロジェクトドキュメント](/docs)を参照してください。

パッケージ固有のアーキテクチャ設計については、[ARCHITECTURE.md](./ARCHITECTURE.md)を参照してください。

## 関連ドキュメント

- [PRD](/docs/prd.md): プロダクト要求定義
- [SRS](/docs/srs.md): ソフトウェア要件定義
- [SDD](/docs/sdd.md): システム設計ドキュメント
