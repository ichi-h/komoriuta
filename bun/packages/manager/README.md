# komo-manager

Komoriuta のマネージャーアプリケーション。サーバーの電源管理を行う Web アプリケーションです。

## アーキテクチャ

komo-manager は単一実行ファイルで動作し、以下の 3 つのコンポーネントで構成されます：

- **Proxy (Bun Serve)**: フロントエンドとバックエンドへのルーティング
- **Backend (Fastify)**: API、データベース、ビジネスロジック
- **Frontend (React)**: ユーザーインターフェース

## ディレクトリ構成

```
src/
├── index.ts              # エントリーポイント
├── proxy/                # Proxyサーバー
│   ├── index.ts
│   └── router.ts
├── backend/              # Backendサーバー
│   ├── index.ts
│   ├── server.ts
│   ├── db/               # データベース
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── services/         # ビジネスロジック
│   │   ├── auth.ts
│   │   ├── server.ts
│   │   ├── heartbeat.ts
│   │   └── wol.ts
│   ├── routes/           # APIルーティング
│   │   ├── auth.ts
│   │   └── connect.ts
│   ├── middleware/       # ミドルウェア
│   │   ├── auth.ts
│   │   └── error.ts
│   └── utils/            # ユーティリティ
│       ├── logger.ts
│       └── crypto.ts
├── frontend/             # Frontendアプリ
│   ├── index.tsx
│   ├── App.tsx
│   ├── index.html
│   ├── components/       # Reactコンポーネント
│   │   └── LoginForm.tsx
│   ├── pages/            # ページコンポーネント
│   │   ├── Login.tsx
│   │   ├── Servers.tsx
│   │   └── ServerDetail.tsx
│   └── styles/           # スタイル
│       └── index.css
└── shared/               # 共通
    ├── types/
    │   └── index.ts
    └── constants/
        └── index.ts
```

## 開発

### 前提条件

- Bun
- Nix (開発環境)

### セットアップ

```bash
# プロジェクトのルートで依存関係をインストール
bun install

# パッケージディレクトリに移動
cd bun/packages/manager
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

### 実行

```bash
bun run start
```

## 環境変数

### 環境変数ファイルの設定

開発環境では、`.env.example`をコピーして`.env`ファイルを作成できます:

```bash
cp .env.example .env
```

`.env`ファイルを編集して、必要な環境変数を設定してください。

**重要**: 本番環境では以下の環境変数を必ず設定してください:

- `PASSWORD_HASH`: 管理者パスワードの scrypt ハッシュ
- `COOKIE_SECRET`: Cookie 署名用のランダムな文字列

#### パスワードハッシュの生成

管理者パスワードのハッシュを生成するには、以下のスクリプトを使用します:

```bash
bun run scripts/hash-password.ts <password>
```

例:

```bash
bun run scripts/hash-password.ts mySecurePassword123
```

生成されたハッシュを`.env`ファイルの`PASSWORD_HASH`に設定してください。

### 環境変数の管理

環境変数はバックエンドとフロントエンドで分離して管理されています。

#### バックエンド

`src/backend/utils/env.ts` でバックエンド専用の環境変数を管理:

```typescript
import { getEnv } from "./backend/utils/env";

// 環境変数を取得（型安全）
const env = getEnv();
console.log(env.PORT); // number
console.log(env.DB_PATH); // string
console.log(env.DISABLE_FILE_LOG); // boolean
```

本番環境では、`PASSWORD_HASH` と `COOKIE_SECRET` の設定が必須です。

#### フロントエンド

`src/frontend/utils/env.ts` でフロントエンド専用の環境変数を管理:

```typescript
import { getEnv } from "./frontend/utils/env";

// 環境変数を取得（型安全）
const env = getEnv();
console.log(env.API_URL); // string
```

### 環境変数一覧

#### バックエンド環境変数

| 変数名                     | 説明                                             | デフォルト値                  |
| -------------------------- | ------------------------------------------------ | ----------------------------- |
| `PORT`                     | Proxy サーバーのポート                           | 3000                          |
| `HOST`                     | Proxy サーバーのホスト                           | 0.0.0.0                       |
| `BACKEND_PORT`             | Backend サーバーのポート                         | 3001                          |
| `BACKEND_HOST`             | Backend サーバーのホスト                         | 127.0.0.1                     |
| `DB_PATH`                  | SQLite データベースのパス                        | ./data/komoriuta.db           |
| `USER_ID`                  | 管理者ユーザー ID                                | admin                         |
| `PASSWORD_HASH`            | 管理者パスワード(scrypt ハッシュ)                | -                             |
| `SESSION_MAX_AGE`          | セッション有効期限（秒）                         | 86400                         |
| `TOKEN_EXPIRES_SECONDS`    | アクセストークン有効期限（秒）、0 で無期限       | 7776000                       |
| `ALLOWED_ORIGIN`           | CORS 許可オリジン                                | http://localhost:3000         |
| `COOKIE_SECRET`            | Cookie 署名用シークレット                        | -                             |
| `LOG_FILE_PATH`            | ログファイル出力先パス（相対パスまたは絶対パス） | ./logs/komo-manager.log.jsonl |
| `DISABLE_FILE_LOG`         | ファイルログを無効化（true/false）               | false                         |
| `LOG_ROTATION_GENERATIONS` | ログローテーション世代数                         | 7                             |

#### フロントエンド環境変数

| 変数名    | 説明               | デフォルト値          |
| --------- | ------------------ | --------------------- |
| `API_URL` | Backend API の URL | http://localhost:3001 |

## 主要機能

### Backend

- **認証**: ID/パスワード認証、セッション管理
- **サーバー管理**: CRUD 操作、電源ステータス管理
- **ハートビート監視**: 定期的なステータスチェック、自動同期
- **Wake-on-LAN**: Magic Packet 送信による電源起動
- **Connect API**: Protocol Buffers ベースのエージェント通信

### Frontend

- **ログイン画面** (`/login`)
- **サーバー管理画面** (`/servers`)
- **サーバー詳細画面** (`/servers/:id`)

## セキュリティ

- パスワードとアクセストークンは scrypt でハッシュ化
- セッションは HttpOnly、Secure、SameSite=Strict 設定
- CORS 設定により同一オリジンのみ許可
- localhost 以外は HTTPS 強制
- ログイン試行回数制限（5 回失敗で 10 分間ブロック）

## ログ

- **フォーマット**: JSON Lines
- **出力先**: 標準出力 + ファイル（オプション）
- **ローテーション**: 1 日ごと、デフォルト 7 世代保持

## データベース

SQLite を使用。以下のテーブルを管理：

- `servers`: サーバー情報
- `access_tokens`: エージェント認証トークン

詳細は `/docs/sdd.md` を参照。
