/**
 * データベースマイグレーション管理
 */

import type { Database } from 'bun:sqlite';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';

interface Migration {
  version: number;
  name: string;
  up: (db: Database) => void;
  down?: (db: Database) => void;
}

/**
 * マイグレーションバージョン管理テーブルを作成
 */
function createMigrationTable(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * 現在のマイグレーションバージョンを取得
 */
function getCurrentVersion(db: Database): number {
  const result = db
    .query<{ version: number }, []>(
      'SELECT MAX(version) as version FROM schema_migrations',
    )
    .get();
  return result?.version ?? 0;
}

/**
 * マイグレーションを記録
 */
function recordMigration(db: Database, version: number, name: string): void {
  db.run('INSERT INTO schema_migrations (version, name) VALUES (?, ?)', [
    version,
    name,
  ]);
}

/**
 * マイグレーション定義を読み込み
 */
async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = join(import.meta.dir, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.ts'))
    .sort();

  const migrations: Migration[] = [];
  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const module = await import(filePath);
    migrations.push(module.default);
  }

  return migrations;
}

/**
 * マイグレーションを実行
 */
export async function runMigrations(db: Database): Promise<void> {
  try {
    // マイグレーションテーブルの作成
    createMigrationTable(db);

    const currentVersion = getCurrentVersion(db);
    const migrations = await loadMigrations();

    // 未適用のマイグレーションを実行
    const pendingMigrations = migrations.filter(
      (m) => m.version > currentVersion,
    );

    if (pendingMigrations.length === 0) {
      logger.info({
        type: 'database',
        message: `Database is up to date (version: ${currentVersion})`,
      });
      return;
    }

    logger.info({
      type: 'database',
      message: `Running ${pendingMigrations.length} pending migrations...`,
    });

    for (const migration of pendingMigrations) {
      logger.info({
        type: 'database',
        message: `Applying migration ${migration.version}: ${migration.name}`,
      });

      // トランザクション内でマイグレーションを実行
      db.run('BEGIN TRANSACTION');
      try {
        migration.up(db);
        recordMigration(db, migration.version, migration.name);
        db.run('COMMIT');

        logger.info({
          type: 'database',
          message: `Migration ${migration.version} applied successfully`,
        });
      } catch (error) {
        db.run('ROLLBACK');
        throw error;
      }
    }

    logger.info({
      type: 'database',
      message: 'All migrations completed successfully',
    });
  } catch (error) {
    logger.error({
      type: 'error',
      message: 'Failed to run migrations',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * マイグレーションをロールバック（開発用）
 */
export async function rollbackMigration(
  db: Database,
  targetVersion?: number,
): Promise<void> {
  try {
    createMigrationTable(db);

    const currentVersion = getCurrentVersion(db);
    if (currentVersion === 0) {
      logger.info({
        type: 'database',
        message: 'No migrations to rollback',
      });
      return;
    }

    const migrations = await loadMigrations();
    const target = targetVersion ?? currentVersion - 1;

    const migrationsToRollback = migrations
      .filter((m) => m.version > target && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        logger.warn({
          type: 'database',
          message: `Migration ${migration.version} has no down method, skipping rollback`,
        });
        continue;
      }

      logger.info({
        type: 'database',
        message: `Rolling back migration ${migration.version}: ${migration.name}`,
      });

      db.run('BEGIN TRANSACTION');
      try {
        migration.down(db);
        db.run('DELETE FROM schema_migrations WHERE version = ?', [
          migration.version,
        ]);
        db.run('COMMIT');

        logger.info({
          type: 'database',
          message: `Migration ${migration.version} rolled back successfully`,
        });
      } catch (error) {
        db.run('ROLLBACK');
        throw error;
      }
    }
  } catch (error) {
    logger.error({
      type: 'error',
      message: 'Failed to rollback migration',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
