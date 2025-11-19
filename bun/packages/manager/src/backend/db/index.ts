/**
 * データベース初期化と接続管理
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { logger } from '../utils/logger';

let db: Database | null = null;

export async function initDatabase() {
  const dbPath = process.env.DB_PATH || './data/komoriuta.db';

  try {
    // ディレクトリが存在しない場合は作成
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    db = new Database(dbPath, { create: true });

    // テーブル作成
    await createTables();

    logger.info({
      type: 'database',
      message: `Database initialized at ${dbPath}`,
    });
  } catch (error) {
    logger.error({
      type: 'error',
      message: 'Failed to initialize database',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function createTables() {
  if (!db) throw new Error('Database not initialized');

  // serversテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      mac_address TEXT NOT NULL,
      power_status INTEGER NOT NULL DEFAULT 0,
      heartbeat_status INTEGER NOT NULL DEFAULT 0,
      previous_heartbeat_status INTEGER NOT NULL DEFAULT 0,
      heartbeat_interval INTEGER NOT NULL DEFAULT 60,
      last_heartbeat_at DATETIME,
      last_power_changed_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // access_tokensテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
    )
  `);
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
