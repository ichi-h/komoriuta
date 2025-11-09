# Code Style and Conventions

## 全般
- **言語**: 開発者は日本語を話すため、ドキュメントやコメントは日本語で記述
- **文字エンコーディング**: UTF-8

## TypeScript (Manager)
### スタイル
- **リンター・フォーマッター**: Biome
- **命名規則**:
  - camelCase: 変数、関数
  - PascalCase: クラス、型、インターフェース、Reactコンポーネント
  - UPPER_SNAKE_CASE: 定数

### ベストプラクティス
- 型安全性を最大限活用
- `any`の使用を避ける
- 明示的な型アノテーションを推奨
- React: 関数コンポーネントとHooksを使用

## Go (Agent)
### スタイル
- 標準の `go fmt` を使用
- `go vet` でリンティング

### 命名規則
- camelCase: プライベート変数・関数
- PascalCase: エクスポートされる変数・関数・型
- snake_case: ファイル名（例: `komo_agent.go`）

### ベストプラクティス
- エラーハンドリングを適切に行う
- `defer` を活用したリソース管理
- シンプルで読みやすいコードを心がける

## Protocol Buffers
- **命名規則**: snake_case（フィールド名）
- **ファイル構造**: `/proto/` ディレクトリに集約

## ログ
### フォーマット
- **JSON Lines形式**
- **タイムスタンプ**: ISO 8601形式
- **レベル**: INFO, WARN, ERROR

### 出力先
- 標準出力（常時）
- ファイル出力（オプション）
  - Manager: `/var/log/komoriuta/komo-manager.log.jsonl`
  - Agent CLI: `/var/log/komoriuta/komo-agent.log.jsonl`
  - Agent Daemon: `/var/log/komoriuta/komolet.log.jsonl`

### セキュリティ
- 機密情報（パスワード、トークンなど）はマスクする
- ログファイルのパーミッション: 600

## セキュリティ
- **認証**: scryptでパスワードハッシュ化
- **アクセストークン**: Base64エンコード、Bearer Token方式
- **HTTPS強制**: localhostを除く
- **CSRF対策**: CORS設定、SameSite=Strict
- **セッション管理**: HttpOnly, Secure属性付きCookie

## データベース
- **削除方式**: 物理削除
- **日時フィールド**: `created_at`, `updated_at`を含める

## Git
- **ブランチ戦略**: 明示されていないが、mainブランチが存在
- **コミットメッセージ**: 明確で簡潔な説明

## デザインパターン
- **設定管理**: 環境変数またはJSONファイル
- **エラーハンドリング**: リトライロジック（最大2回）
- **ステータス管理**: 状態遷移を明確に定義
