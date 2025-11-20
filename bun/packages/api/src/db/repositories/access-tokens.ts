/**
 * AccessTokensテーブルのリポジトリ
 */

import type { Database } from 'bun:sqlite';
import { getDatabase } from '../index';
import type { AccessToken } from '../schema';

export class AccessTokensRepository {
  private db: Database;

  constructor(db?: Database) {
    this.db = db ?? getDatabase();
  }

  /**
   * ID でアクセストークン取得
   */
  findById(id: number): AccessToken | null {
    return this.db
      .query('SELECT * FROM access_tokens WHERE id = ?')
      .get(id) as AccessToken | null;
  }

  /**
   * サーバー ID でアクセストークン取得
   */
  findByServerId(serverId: number): AccessToken | null {
    return this.db
      .query('SELECT * FROM access_tokens WHERE server_id = ?')
      .get(serverId) as AccessToken | null;
  }

  /**
   * アクセストークン作成
   */
  create(data: {
    serverId: number;
    tokenHash: string;
    expiresAt?: string | null;
  }): number {
    const result = this.db.run(
      `INSERT INTO access_tokens (server_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [data.serverId, data.tokenHash, data.expiresAt ?? null],
    );
    return result.lastInsertRowid as number;
  }

  /**
   * アクセストークン更新
   */
  update(
    id: number,
    data: {
      tokenHash?: string;
      expiresAt?: string | null;
    },
  ): boolean {
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.tokenHash !== undefined) {
      updates.push('token_hash = ?');
      values.push(data.tokenHash);
    }
    if (data.expiresAt !== undefined) {
      updates.push('expires_at = ?');
      values.push(data.expiresAt);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(String(id));

    const result = this.db.run(
      `UPDATE access_tokens SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );

    return result.changes > 0;
  }

  /**
   * サーバー ID でアクセストークン更新
   */
  updateByServerId(
    serverId: number,
    data: {
      tokenHash?: string;
      expiresAt?: string | null;
    },
  ): boolean {
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.tokenHash !== undefined) {
      updates.push('token_hash = ?');
      values.push(data.tokenHash);
    }
    if (data.expiresAt !== undefined) {
      updates.push('expires_at = ?');
      values.push(data.expiresAt);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(String(serverId));

    const result = this.db.run(
      `UPDATE access_tokens SET ${updates.join(', ')} WHERE server_id = ?`,
      values,
    );

    return result.changes > 0;
  }

  /**
   * アクセストークン削除
   */
  delete(id: number): boolean {
    const result = this.db.run('DELETE FROM access_tokens WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * サーバー ID でアクセストークン削除
   */
  deleteByServerId(serverId: number): boolean {
    const result = this.db.run(
      'DELETE FROM access_tokens WHERE server_id = ?',
      [serverId],
    );
    return result.changes > 0;
  }
}
