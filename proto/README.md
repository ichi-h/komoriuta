# Komoriuta Protocol Buffers

このディレクトリには、Komoriutaアプリケーションで使用するProtobuf定義が含まれています。

## 環境構築

```bash
# direnvが有効な場合は自動的に環境が読み込まれます
cd proto

# または手動でNix開発環境に入る
nix develop

# Bufの依存関係を更新
buf dep update
```

## ディレクトリ構成

```
proto/
├── buf.yaml           # Buf設定ファイル
├── buf.gen.yaml       # コード生成設定
├── flake.nix          # Nix開発環境定義
├── gen/               # 生成されたコード（gitignore対象）
│   ├── go/           # Go用の生成コード
│   └── ts/           # TypeScript用の生成コード
└── komoriuta/         # Protobuf定義ファイル
    └── v1/
        ├── auth.proto
        ├── server.proto
        ├── power.proto
        ├── access_token.proto
        └── agent.proto
```

## コード生成

```bash
# すべてのProtobuf定義からコードを生成
buf generate

# 特定のファイルのみ生成
buf generate --path komoriuta/v1/auth.proto
```

## Linting

```bash
# Lintチェック
buf lint

# Breaking changeのチェック
buf breaking --against '.git#branch=main'
```

## フォーマット

```bash
# Protobufファイルのフォーマット
buf format -w
```

## 利用可能なツール

- `protoc`: Protobufコンパイラ
- `protoc-gen-go`: Go用のProtobufプラグイン
- `protoc-gen-connect-go`: Go用のConnectプラグイン
- `buf`: モダンなProtobuf開発ツール
- `grpcurl`: gRPC/Connectエンドポイントのテストツール

## サービス定義

### ユーザー向けサービス（Cookie認証）

- `AuthService`: ユーザー認証
- `ServerService`: サーバー管理
- `PowerService`: 電源操作
- `AccessTokenService`: アクセストークン管理

### エージェント向けサービス（Bearer Token認証）

- `AgentService`: エージェント通信（ルーティング隔離: `/agent/*`）

## 認証方式

- **ユーザー ↔ マネージャー**: Cookie認証（セッションベース）
- **エージェント ↔ マネージャー**: Bearer Token認証（アクセストークン）
