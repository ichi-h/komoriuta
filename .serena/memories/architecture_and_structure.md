# Architecture and Structure

## システムアーキテクチャ

```
同一ネットワーク内
├── Server 1-N (管理対象サーバー)
│   ├── Agent (komolet daemon + komo-agent CLI)
│   └── OS
└── Manager Server
    ├── Manager (komo-manager)
    │   ├── Backend (ElysiaJS)
    │   ├── Frontend (React)
    │   └── Proxy (Bun Serve)
    └── Database (SQLite)
```

## 通信フロー

### Manager ⟷ Agent
- **Protocol**: HTTP/HTTPS + Connect (Protocol Buffers)
- **Agent → Manager**: ハートビート送信、マニフェスト取得
- **Manager → Agent**: Wake-on-LAN (Magic Packet)

### User ⟷ Manager
- **Protocol**: HTTP/HTTPS
- **UI Access**: ブラウザ経由でアクセス
- **Authentication**: Cookie-based session

## コンポーネント詳細

### Manager (komo-manager)
単一実行ファイルで動作

#### Backend
- ElysiaJS フレームワーク
- SQLite データベース接続
- Connect API サーバー
- ハートビート監視ロジック
- Wake-on-LAN 実装

#### Frontend
- React ベースのSPA
- shadcn/ui コンポーネント
- 以下の画面を提供:
  - ログイン画面 (`/login`)
  - サーバー管理画面 (`/servers`)
  - サーバー詳細画面 (`/servers/{id}`)

#### Proxy
- Bun Serve
- フロントエンドとバックエンドのルーティング
- HTTPS/HTTP対応

### Agent
2つのコンポーネントで構成

#### komo-agent (CLI)
設定管理とkomolet制御用CLIツール
- `init`: 初期設定
- `set`: 設定変更
- `enable/disable`: 有効化/無効化
- `status`: 状態確認
- `reload`: 設定再読み込み

#### komolet (Daemon)
systemd等で管理されるバックグラウンドプロセス
- マニフェスト取得
- ハートビート送信
- シャットダウン実行

### 設定ファイル
- Manager: 環境変数
- Agent: `/etc/komoriuta/config.json`

## データベーススキーマ

### servers テーブル
- サーバー情報管理
- 電源ステータス、ハートビートステータス保存
- UUID、名前、MACアドレス等

### access_tokens テーブル
- サーバー毎のアクセストークン管理
- scryptでハッシュ化して保存

## ステータス管理

### Power Status (電源ステータス)
Manager側で規定するあるべき状態
- ON
- OFF

### Heartbeat Status (ハートビートステータス)
Agent側から報告する現在の状態
- Launched: 起動直後
- ON: 稼働中
- Stopping: 停止処理中
- None: 報告なし（停止状態）

### Current Status (カレントステータス)
電源ステータスとハートビートステータスから算出
- ON, OFF
- Starting, Stopping
- Applying
- SyncedON, SyncedOFF
- Lost, Error

詳細な状態遷移は `/docs/srs.md` を参照

## ログ出力

### ファイル配置
- `/var/log/komoriuta/komo-manager.log.jsonl`
- `/var/log/komoriuta/komo-agent.log.jsonl`
- `/var/log/komoriuta/komolet.log.jsonl`

### ローテーション
- logrotateを使用
- 1日ごと、7世代保持（環境変数で変更可能）
- パーミッション: 600

## セキュリティ層

### 認証・認可
- ユーザー: ID/パスワード + セッションCookie
- Agent: Bearer Token (Base64エンコード)

### 通信
- localhost以外: HTTPS強制
- CORS設定: 同一オリジンのみ
- CSRF対策: SameSite=Strict

### データ保護
- パスワード: scryptハッシュ化
- アクセストークン: scryptハッシュ化
- ログ: 機密情報マスク
