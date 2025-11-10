# Komoriuta API Schema

このドキュメントは、Komoriutaアプリケーションで使用するすべてのProtobuf定義の概要を説明します。

## サービス一覧

### ユーザー向けサービス（Cookie認証）

これらのサービスは管理画面から利用され、セッションCookieによる認証が必要です。

#### 1. AuthService (`auth.proto`)
ユーザー認証を管理するサービス

**エンドポイント:**
- `Login`: ユーザーIDとパスワードでログイン
- `Logout`: 現在のセッションを無効化
- `Verify`: セッションの有効性を確認

#### 2. ServerService (`server.proto`)
サーバーの管理を行うサービス

**エンドポイント:**
- `ListServers`: 管理下のサーバー一覧を取得
- `GetServer`: 特定サーバーの詳細情報を取得
- `CreateServer`: 新規サーバーを追加
- `UpdateServer`: サーバー情報を更新
- `DeleteServer`: サーバーを削除
- `WatchServers`: サーバーステータスのリアルタイム更新（ストリーミング、オプション）

#### 3. PowerService (`power.proto`)
サーバーの電源操作を行うサービス

**エンドポイント:**
- `TurnOn`: Wake-on-LANでサーバーを起動
- `TurnOff`: エージェント経由でサーバーをシャットダウン

#### 4. AccessTokenService (`access_token.proto`)
アクセストークンを管理するサービス

**エンドポイント:**
- `RotateToken`: アクセストークンをローテーション（旧トークンは無効化）

### エージェント向けサービス（Bearer Token認証）

このサービスはエージェントから利用され、Bearer Token認証が必要です。
**重要**: これらのエンドポイントは `/agent/*` のような専用パスで隔離する必要があります。

#### 5. AgentService (`agent.proto`)
エージェントとマネージャー間の通信を行うサービス

**エンドポイント:**
- `GetManifest`: マニフェスト（電源ステータス、ハートビート間隔）を取得
- `SendHeartbeat`: ハートビート（死活状況）を送信

## データ型

### Enums

#### PowerStatus
サーバーの望ましい電源状態
- `POWER_STATUS_OFF`: 電源オフ
- `POWER_STATUS_ON`: 電源オン

#### HeartbeatStatus
エージェントが報告する現在のステータス
- `HEARTBEAT_STATUS_NONE`: ハートビート未受信
- `HEARTBEAT_STATUS_LAUNCHED`: エージェント起動直後
- `HEARTBEAT_STATUS_ON`: エージェント正常稼働中
- `HEARTBEAT_STATUS_STOPPING`: エージェントシャットダウン中

#### CurrentStatus
電源ステータスとハートビートステータスから算出される現在の状態
- `CURRENT_STATUS_APPLYING`: 電源ステータス変更を適用中
- `CURRENT_STATUS_ON`: サーバー稼働中
- `CURRENT_STATUS_OFF`: サーバー停止中
- `CURRENT_STATUS_STARTING`: サーバー起動中
- `CURRENT_STATUS_STOPPING`: サーバーシャットダウン中
- `CURRENT_STATUS_SYNCED_ON`: 自動的にONに同期
- `CURRENT_STATUS_SYNCED_OFF`: 自動的にOFFに同期
- `CURRENT_STATUS_LOST`: 通信途絶
- `CURRENT_STATUS_WARNING`: 注意が必要
- `CURRENT_STATUS_ERROR`: エラー状態

#### ErrorCode
共通のエラーコード（`common.proto`）
- 認証エラー (1000-1099)
- バリデーションエラー (1100-1199)
- リソースエラー (1200-1299)
- サーバーエラー (1300-1399)
- エージェントエラー (1400-1499)
- 電源操作エラー (1500-1599)

### Messages

#### Server
完全なサーバー情報を含むメッセージ
- id, uuid, name
- mac_address
- power_status, heartbeat_status, previous_heartbeat_status
- heartbeat_interval
- current_status
- タイムスタンプ（last_heartbeat_at, last_power_changed_at, created_at, updated_at）

#### ServerSummary
サーバー一覧表示用の簡易情報
- id, uuid, name
- power_status, current_status

## 認証とルーティング

### Cookie認証（ユーザー向け）
- **対象サービス**: AuthService, ServerService, PowerService, AccessTokenService
- **認証方式**: セッションCookie (`session_id`)
- **Cookie属性**:
  - HttpOnly: true
  - Secure: true
  - SameSite: Strict
  - Path: /
- **ルーティング**: 通常のパス（例: `/`, `/komoriuta.v1.ServerService/*`）

### Bearer Token認証（エージェント向け）
- **対象サービス**: AgentService
- **認証方式**: `Authorization: Bearer {access_token}` ヘッダー
- **トークン形式**: 32文字の大小英数字
- **ルーティング**: 隔離されたパス（例: `/agent/komoriuta.v1.AgentService/*`）
- **重要**: ユーザー向けエンドポイントと完全に分離すること

## バリデーション

### サーバー作成時
- **name**: 1文字以上
- **mac_address**: 正規表現 `^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$`
- **heartbeat_interval**: 5〜60秒

### ログイン
- 5回連続失敗でIPアドレス単位で10分間ブロック

## 使用例

### コード生成
```bash
cd proto
nix develop
buf generate
```

### 生成されるコード
- **Go**: `gen/go/komoriuta/v1/`
  - `*_connect.go`: Connect サーバー/クライアントコード
  - `*.pb.go`: Protobuf メッセージ定義
- **TypeScript**: `gen/ts/komoriuta/v1/`
  - `*_connect.ts`: Connect クライアントコード
  - `*.ts`: Protobuf メッセージ定義

## 参考資料

- [Connect Protocol](https://connectrpc.com/)
- [Protocol Buffers](https://protobuf.dev/)
- [Buf](https://buf.build/)
