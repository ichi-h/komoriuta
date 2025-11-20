/**
 * データベース初期化と接続管理
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { getEnv } from '../utils/env';
import { logger } from '../utils/logger';
import { runMigrations } from './migrations';

let db: Database | null = null;

export async function initDatabase() {
  const { DB_PATH } = getEnv();
  const dbPath = DB_PATH;

  try {
    // ディレクトリが存在しない場合は作成
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    db = new Database(dbPath, { create: true });

    // マイグレーションを実行
    await runMigrations(db);

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

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
