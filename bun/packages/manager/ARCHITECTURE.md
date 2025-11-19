# komo-manager ディレクトリ構成設計

## 設計方針

komo-manager は以下の要件に基づいて設計されています：

1. **単一実行ファイル**: Proxy、Backend、Frontend を含む単一バイナリで動作
2. **レイヤー分離**: Proxy、Backend、Frontend の責務を明確に分離
3. **保守性**: 各層がさらに適切なサブディレクトリに分割され、関心の分離を実現
4. **拡張性**: 新機能追加時に適切な場所に配置できる構造

## ディレクトリツリー

```
bun/packages/manager/
├── package.json              # パッケージ定義
├── tsconfig.json             # TypeScript設定
├── README.md                 # パッケージドキュメント
├── .gitignore                # Git除外設定
└── src/
    ├── index.ts              # エントリーポイント
    │
    ├── proxy/                # プロキシ層
    │   ├── index.ts          # プロキシサーバー起動とルーティング
    │   └── middleware.ts     # HTTPS強制ミドルウェア
    │
    ├── backend/              # バックエンド層
    │   ├── index.ts          # バックエンドサーバー起動
    │   ├── server.ts         # Fastifyインスタンス設定
    │   │
    │   ├── db/               # データベース層
    │   │   ├── index.ts      # DB接続・初期化
    │   │   └── schema.ts     # スキーマ定義
    │   │
    │   ├── services/         # ビジネスロジック層
    │   │   ├── auth.ts       # 認証サービス
    │   │   ├── server.ts     # サーバー管理サービス
    │   │   ├── heartbeat.ts  # ハートビート監視サービス
    │   │   └── wol.ts        # Wake-on-LANサービス
    │   │
    │   ├── routes/           # ルーティング層
    │   │   ├── auth.ts       # 認証APIルート
    │   │   └── connect.ts    # Connect APIルート
    │   │
    │   ├── middleware/       # ミドルウェア層
    │   │   ├── auth.ts       # 認証ミドルウェア
    │   │   └── error.ts      # エラーハンドリング
    │   │
    │   └── utils/            # ユーティリティ
    │       ├── logger.ts     # ログ出力
    │       └── crypto.ts     # 暗号化・ハッシュ化
    │
    ├── frontend/             # フロントエンド層
    │   ├── index.tsx         # Reactエントリーポイント
    │   ├── App.tsx           # メインAppコンポーネント
    │   ├── index.html        # HTMLテンプレート
    │   │
    │   ├── components/       # 再利用可能コンポーネント
    │   │   ├── ui/           # shadcn/uiコンポーネント（将来追加）
    │   │   └── LoginForm.tsx # ログインフォーム
    │   │
    │   ├── pages/            # ページコンポーネント
    │   │   ├── Login.tsx     # ログインページ
    │   │   ├── Servers.tsx   # サーバー管理ページ
    │   │   └── ServerDetail.tsx # サーバー詳細ページ
    │   │
    │   ├── hooks/            # カスタムHooks（将来追加）
    │   ├── utils/            # フロントエンドユーティリティ（将来追加）
    │   └── styles/           # スタイル
    │       └── index.css     # グローバルスタイル
    │
    └── shared/               # 共通定義
        ├── types/            # 型定義
        │   └── index.ts
        └── constants/        # 定数
            └── index.ts
```

## 各層の責務

### Proxy 層 (`src/proxy/`)

#### サーバー起動とルーティング (`index.ts`)

- **Bun の routes 機能を活用**

  - `routes` オプションで `index.html` を自動配信
  - 開発モード（`FRONTEND_DEV_MODE=true`）でホットリロード（HMR）有効化
  - すべての未マッチルートで SPA として `index.html` を返す

- **API リクエストのプロキシ**
  - `/api/` で始まるパス → Backend へプロキシ
  - `/komoriuta.v1.` で始まるパス → Backend へプロキシ（Connect RPC）
  - その他のパス → Bun が自動的に `index.html` や静的アセットを配信

#### ミドルウェア (`middleware.ts`)

- **HTTPS 強制（localhost 以外）**
  - localhost/127.0.0.1/::1 からのアクセスは HTTP を許可
  - それ以外の場合、HTTP アクセスを HTTPS へリダイレクト（301）
  - リバースプロキシ経由を想定し、`X-Forwarded-Proto` ヘッダーもチェック
  - TLS 終端は外部のリバースプロキシ（nginx/traefik 等）に委譲

### Backend 層 (`src/backend/`)

#### データベース (`db/`)

- SQLite 接続管理
- テーブル作成・マイグレーション
- スキーマ定義

#### サービス (`services/`)

- ビジネスロジックの実装
- データベース操作のカプセル化
- 外部システムとの連携（Wake-on-LAN 等）

#### ルーティング (`routes/`)

- API エンドポイントの定義
- リクエスト/レスポンスのマッピング
- Connect RPC ハンドラーの登録

#### ミドルウェア (`middleware/`)

- 認証・認可
- エラーハンドリング
- リクエストロギング

#### ユーティリティ (`utils/`)

- ログ出力
- 暗号化・ハッシュ化
- その他ヘルパー関数

### Frontend 層 (`src/frontend/`)

#### ページ (`pages/`)

- ルーティングに対応するページコンポーネント
- ページ固有のロジック

#### コンポーネント (`components/`)

- 再利用可能な UI コンポーネント
- shadcn/ui コンポーネントの配置場所

#### スタイル (`styles/`)

- グローバル CSS
- Tailwind CSS 設定

### 共通層 (`src/shared/`)

- 型定義：Backend/Frontend 間で共有する型
- 定数：アプリケーション全体で使用する定数

## 拡張ポイント

### 新しい API エンドポイントの追加

1. `backend/services/` にビジネスロジックを実装
2. `backend/routes/` に新しいルートファイルを作成
3. `backend/server.ts` でルートを登録

### 新しいページの追加

1. `frontend/pages/` に新しいページコンポーネントを作成
2. `frontend/App.tsx` でルーティングを追加
3. 必要に応じて `frontend/components/` に再利用コンポーネントを作成

### 新しいサービスの追加

1. `backend/services/` に新しいサービスファイルを作成
2. 必要に応じて `backend/routes/` で API を公開

## セキュリティ考慮事項

- 機密情報は環境変数で管理
- パスワード・トークンは scrypt でハッシュ化して保存
- ログ出力時は機密情報をマスク
- ファイル権限はドキュメント仕様に準拠（600）

## 今後の課題

### Proxy

- ✅ フロントエンドの静的ファイル配信の実装
- ✅ HTTPS/HTTP 切り替えロジックの実装
- 静的ファイルのキャッシュ制御の追加
- gzip/brotli 圧縮の実装

### Backend

- Connect API ハンドラーの完全実装
- データベースマイグレーション機能の追加
- ハートビート監視の起動処理追加
- エラーハンドリングの強化

### Frontend

- shadcn/ui コンポーネントの導入
- サーバー一覧・詳細画面の実装
- 認証状態管理の実装
- エラー表示の改善

### 共通

- E2E テストの追加
- ログローテーション設定の実装
- Docker/Podman コンテナ化
- CI/CD 設定

## 関連ドキュメント

- [PRD](/docs/prd.md): プロダクト要求定義
- [SRS](/docs/srs.md): ソフトウェア要件定義
- [SDD](/docs/sdd.md): システム設計ドキュメント
- [パッケージ README](./README.md): 開発者向けドキュメント
