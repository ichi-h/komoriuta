/**
 * トランザクション管理ユーティリティ
 */

import type { Database } from 'bun:sqlite';
import { logger } from '../utils/logger';
import { getDatabase } from './index';

/**
 * トランザクション内で処理を実行
 * エラー時は自動的にロールバック
 */
export async function withTransaction<T>(
  fn: (db: Database) => T | Promise<T>,
  db?: Database,
): Promise<T> {
  const database = db ?? getDatabase();

  try {
    database.run('BEGIN TRANSACTION');
    const result = await fn(database);
    database.run('COMMIT');
    return result;
  } catch (error) {
    database.run('ROLLBACK');
    logger.error({
      type: 'error',
      message: 'Transaction failed and rolled back',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * 同期版トランザクション実行
 */
export function withTransactionSync<T>(
  fn: (db: Database) => T,
  db?: Database,
): T {
  const database = db ?? getDatabase();

  try {
    database.run('BEGIN TRANSACTION');
    const result = fn(database);
    database.run('COMMIT');
    return result;
  } catch (error) {
    database.run('ROLLBACK');
    logger.error({
      type: 'error',
      message: 'Transaction failed and rolled back',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * トランザクションコンテキスト
 * 手動でコミット/ロールバックを制御したい場合に使用
 */
export class TransactionContext {
  private db: Database;
  private isActive = false;

  constructor(db?: Database) {
    this.db = db ?? getDatabase();
  }

  /**
   * トランザクション開始
   */
  begin(): void {
    if (this.isActive) {
      throw new Error('Transaction is already active');
    }
    this.db.run('BEGIN TRANSACTION');
    this.isActive = true;
  }

  /**
   * コミット
   */
  commit(): void {
    if (!this.isActive) {
      throw new Error('No active transaction to commit');
    }
    this.db.run('COMMIT');
    this.isActive = false;
  }

  /**
   * ロールバック
   */
  rollback(): void {
    if (!this.isActive) {
      throw new Error('No active transaction to rollback');
    }
    this.db.run('ROLLBACK');
    this.isActive = false;
  }

  /**
   * トランザクションが有効かどうか
   */
  isTransactionActive(): boolean {
    return this.isActive;
  }

  /**
   * データベースインスタンス取得
   */
  getDatabase(): Database {
    return this.db;
  }
}
