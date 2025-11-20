# Suggested Commands

## 重要: Nix コマンドの実行方法

このプロジェクトでは Nix と direnv を使用しています。  
nix develop の開発環境へは、direnv allow が行われていれば、各 flake.nix が配置されたディレクトリへ移動するだけで自動的に入ることができます。

## 開発環境のセットアップ

### ルートディレクトリ

```bash
# Nix開発環境に入る（Serena MCPサーバーを利用可能に）
nix develop

# direnvを使用する場合（自動的に開発環境をロード）
direnv allow
```

### Manager (Bun/TypeScript) - /bun

```bash
cd bun

# .envrcが許可されていなかったら許可する
direnv allow

# パッケージのインストール（Bun使用）
bun install

# 開発サーバー起動（想定）
bun run dev

# ビルド（想定）
bun run build

# リンティング & フォーマット（Biome使用）
biome check .
biome format .
```

### Agent (Go) - /go

```bash
cd go

# .envrcが許可されていなかったら許可する
direnv allow

# ビルド
go build

# テスト
go test ./...

# リンティング
go vet ./...

# フォーマット
go fmt ./...
```

## Protocol Buffers

```bash
cd proto

# .envrcが許可されていなかったら許可する
direnv allow

# スキーマからコード生成
buf generate
```

## Git 操作

```bash
# 通常のgitコマンドが使用可能
git status
git add .
git commit -m "message"
git push
```

## ユーティリティコマンド（Linux）

```bash
# ファイル・ディレクトリ操作
ls -la
cd <directory>
find . -name "*.ts"
grep -r "pattern" .

# プロセス管理
ps aux | grep komo
systemctl status <service>

# ログ確認
tail -f /var/log/komoriuta/komo-manager.log.jsonl
journalctl -u <service> -f
```
