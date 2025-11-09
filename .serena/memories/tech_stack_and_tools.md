# Tech Stack and Tools

## 開発環境管理
- **Nix**: 再現可能な開発環境を提供
- **direnv**: 自動的に開発環境をロード（.envrc使用）

## Manager (TypeScript/Bun)
### 言語・ランタイム
- TypeScript
- Bun (高速なJavaScriptランタイム)

### フレームワーク・ライブラリ
- **ElysiaJS**: バックエンドフレームワーク
- **React**: UIライブラリ
- **shadcn/ui**: UIコンポーネントライブラリ
- **Connect**: Protocol BuffersベースのgRPC-like通信

### ツール
- **Biome**: リンター・フォーマッター

### コンテナ
- **Podman**: コンテナランタイム（Docker互換）

## Agent (Go)
### 言語
- Go

### ライブラリ
- **Connect**: Protocol Buffersクライアントコード生成

## データベース
- **SQLite**: 組み込みRDB

## Protocol
- **Protocol Buffers**: スキーマ定義
- **Connect**: HTTP/2ベースのRPC

## システムツール
- **systemd**: プロセス管理（komolet用）
- **logrotate**: ログローテーション
