# Komoriuta Protocol Buffers

このディレクトリには、Komoriuta アプリケーションで使用する Protobuf 定義が含まれています。

## 環境構築

```bash
# direnvが有効な場合は自動的に環境が読み込まれます
cd proto

# Bufの依存関係を更新
buf dep update
```

## ディレクトリ構成

```
proto/
├── buf.yaml           # Buf設定ファイル
├── buf.gen.yaml       # コード生成設定
├── flake.nix          # Nix開発環境定義
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

- `protoc`: Protobuf コンパイラ
- `protoc-gen-go`: Go 用の Protobuf プラグイン
- `protoc-gen-connect-go`: Go 用の Connect プラグイン
- `buf`: モダンな Protobuf 開発ツール
- `grpcurl`: gRPC/Connect エンドポイントのテストツール

## サービス定義

### ユーザー向けサービス（Cookie 認証）

- `AuthService`: ユーザー認証
- `ServerService`: サーバー管理
- `PowerService`: 電源操作
- `AccessTokenService`: アクセストークン管理

### エージェント向けサービス（Bearer Token 認証）

- `AgentService`: エージェント通信（ルーティング隔離: `/agent/*`）

## 認証方式

- **ユーザー ↔ マネージャー**: Cookie 認証（セッションベース）
- **エージェント ↔ マネージャー**: Bearer Token 認証（アクセストークン）
