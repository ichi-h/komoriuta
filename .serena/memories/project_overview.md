# Project Overview

## プロジェクト名
Komoriuta（子守唄）

## プロジェクトの目的
オンプレミス環境のサーバー電源管理システム。複数のサーバーの電源ON/OFFを簡単に管理し、使わない時間帯の電源を落とすことで、サーバーの負荷軽減と電気代削減を実現する。

## 主な機能
- 各サーバーの電源管理（起動・停止・監視）
- サーバーの追加・編集・削除
- Webベースの管理画面の提供
- Wake-on-LAN (WoL) による電源起動
- ハートビート監視による状態管理

## アーキテクチャ
- **Manager**: サーバー管理を行うWebアプリケーション（バックエンド + フロントエンド + プロキシ）
- **Agent**: 各サーバーに常駐するデーモン（komolet）とCLIツール（komo-agent）
- **Database**: SQLite

## 技術スタック

### Manager
- 言語: TypeScript (Bun)
- プロキシ: Bun Serve
- バックエンド: ElysiaJS
- フロントエンド: React + shadcn/ui
- コンテナ: Podman
- プロトコル: Connect (Protocol Buffers)

### Agent
- 言語: Go
- プロトコル: Connect (Protocol Buffers)

## ディレクトリ構造
- `/proto/`: Protocol Buffers スキーマ定義
- `/bun/`: Manager (TypeScript/Bun) 開発環境
- `/go/`: Agent (Go) 開発環境
- `/docs/`: ドキュメント（PRD, SRS, SDD）
- `/.github/`: GitHub設定、Copilot instructions

## 開発環境
Nixベースの開発環境。各サブディレクトリにflake.nixが存在し、必要なツールを提供。
