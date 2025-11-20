/**
 * 初期スキーマの作成
 */

import type { Database } from 'bun:sqlite';

export default {
  version: 1,
  name: 'create_initial_schema',
  up: (db: Database) => {
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
  },
  down: (db: Database) => {
    db.run('DROP TABLE IF EXISTS access_tokens');
    db.run('DROP TABLE IF EXISTS servers');
  },
};
