# komo-manager

Komoriutaのマネージャーアプリケーション。サーバーの電源管理を行うWebアプリケーションです。

## アーキテクチャ

komo-managerは単一実行ファイルで動作し、以下の3つのコンポーネントで構成されます：

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

| 変数名 | 説明 | デフォルト値 |
|--------|------|--------------|
| `PORT` | Proxyサーバーのポート | 3000 |
| `HOST` | Proxyサーバーのホスト | 0.0.0.0 |
| `BACKEND_PORT` | Backendサーバーのポート | 3001 |
| `BACKEND_HOST` | Backendサーバーのホスト | 127.0.0.1 |
| `DB_PATH` | SQLiteデータベースのパス | ./data/komoriuta.db |
| `USER_ID` | 管理者ユーザーID | admin |
| `PASSWORD_HASH` | 管理者パスワード(scryptハッシュ) | - |
| `SESSION_MAX_AGE` | セッション有効期限（秒） | 86400 |
| `TOKEN_EXPIRES_SECONDS` | アクセストークン有効期限（秒）、0で無期限 | 7776000 |
| `ALLOWED_ORIGIN` | CORS許可オリジン | http://localhost:3000 |
| `COOKIE_SECRET` | Cookie署名用シークレット | - |
| `LOG_FILE_PATH` | ログファイルパス | /var/log/komoriuta/komo-manager.log.jsonl |
| `DISABLE_FILE_LOG` | ファイルログを無効化 | false |
| `LOG_ROTATION_GENERATIONS` | ログローテーション世代数 | 7 |

## 主要機能

### Backend

- **認証**: ID/パスワード認証、セッション管理
- **サーバー管理**: CRUD操作、電源ステータス管理
- **ハートビート監視**: 定期的なステータスチェック、自動同期
- **Wake-on-LAN**: Magic Packet送信による電源起動
- **Connect API**: Protocol Buffersベースのエージェント通信

### Frontend

- **ログイン画面** (`/login`)
- **サーバー管理画面** (`/servers`)
- **サーバー詳細画面** (`/servers/:id`)

## セキュリティ

- パスワードとアクセストークンはscryptでハッシュ化
- セッションはHttpOnly、Secure、SameSite=Strict設定
- CORS設定により同一オリジンのみ許可
- localhost以外はHTTPS強制
- ログイン試行回数制限（5回失敗で10分間ブロック）

## ログ

- **フォーマット**: JSON Lines
- **出力先**: 標準出力 + ファイル（オプション）
- **ローテーション**: 1日ごと、デフォルト7世代保持

## データベース

SQLiteを使用。以下のテーブルを管理：

- `servers`: サーバー情報
- `access_tokens`: エージェント認証トークン

詳細は `/docs/sdd.md` を参照。
