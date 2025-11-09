# Suggested Commands

## 重要: Nixコマンドの実行方法
このプロジェクトではNixを使用しているため、コマンドは `nix develop --command` を用いて実行する必要があります。

例: `nix develop --command <コマンド>`

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

# Nix開発環境に入る
nix develop

# または direnv使用
direnv allow

# パッケージのインストール（Bun使用）
nix develop --command bun install

# 開発サーバー起動（想定）
nix develop --command bun run dev

# ビルド（想定）
nix develop --command bun run build

# リンティング & フォーマット（Biome使用）
nix develop --command biome check .
nix develop --command biome format .
```

### Agent (Go) - /go
```bash
cd go

# Nix開発環境に入る
nix develop

# または direnv使用
direnv allow

# ビルド
nix develop --command go build

# テスト
nix develop --command go test ./...

# リンティング
nix develop --command go vet ./...

# フォーマット
nix develop --command go fmt ./...
```

## Protocol Buffers
```bash
# スキーマからコード生成（ツールのセットアップが必要）
# Bun/TypeScript用
nix develop --command buf generate --template buf.gen.yaml

# Go用
nix develop --command buf generate --template buf.gen.yaml
```

## Git操作
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
