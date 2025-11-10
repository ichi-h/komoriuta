# Komoriuta Protobuf Definitions - Quick Start

## ディレクトリ構成

```
proto/
├── buf.yaml              # Buf設定
├── buf.gen.yaml          # コード生成設定
├── flake.nix             # Nix開発環境
├── README.md             # 基本的な使い方
├── SCHEMA.md             # 詳細なスキーマドキュメント
├── .gitignore
├── .envrc                # direnv設定
└── komoriuta/v1/         # Protobuf定義
    ├── auth.proto        # 認証サービス
    ├── server.proto      # サーバー管理サービス
    ├── power.proto       # 電源操作サービス
    ├── access_token.proto # アクセストークン管理サービス
    ├── agent.proto       # エージェント通信サービス
    └── common.proto      # 共通定義（エラーコード等）
```

## クイックスタート

### 1. 環境の準備

```bash
cd proto

# direnvを使用している場合（自動で環境が読み込まれます）
direnv allow

# または手動でNix開発環境に入る
nix develop
```

### 2. 依存関係の更新

```bash
buf dep update
```

### 3. コードの生成

```bash
# すべてのプロトファイルからコードを生成
buf generate --path ./komoriuta

# 生成されたコード:
# - gen/go/komoriuta/v1/     (Go用)
# - gen/ts/komoriuta/v1/     (TypeScript用)
```

### 4. Linting

```bash
# Protobufファイルのチェック
buf lint --path ./komoriuta

# フォーマット
buf format -w --path ./komoriuta
```

## 定義されたサービス

### ユーザー向け（Cookie 認証）

1. **AuthService** - ユーザー認証

   - Login, Logout, Verify

2. **ServerService** - サーバー管理

   - ListServers, GetServer, CreateServer, UpdateServer, DeleteServer, WatchServers

3. **PowerService** - 電源操作

   - TurnOn, TurnOff

4. **AccessTokenService** - トークン管理
   - RotateToken

### エージェント向け（Bearer Token 認証、ルーティング隔離）

5. **AgentService** - エージェント通信
   - GetManifest, SendHeartbeat

## 重要な注意点

### 認証とルーティングの隔離

- **ユーザー向け**: Cookie 認証、通常のルーティング
- **エージェント向け**: Bearer Token 認証、`/agent/*` パスで隔離

### データ型

- **PowerStatus**: OFF, ON
- **HeartbeatStatus**: None, Launched, ON, Stopping
- **CurrentStatus**: Applying, ON, OFF, Starting, Stopping, SyncedON, SyncedOFF, Lost, Warning, Error

### バリデーション

- サーバー名: 1 文字以上
- MAC アドレス: `^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$`
- ハートビート間隔: 5〜60 秒

## 次のステップ

1. `buf generate` でコードを生成
2. 生成されたコードをマネージャー（Bun）とエージェント（Go）のプロジェクトに統合
3. Connect サーバー/クライアントを実装

詳細は `SCHEMA.md` を参照してください。
