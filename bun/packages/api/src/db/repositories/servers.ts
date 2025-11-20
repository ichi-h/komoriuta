/**
 * Serversテーブルのリポジトリ
 */

import type { Database } from 'bun:sqlite';
import { getDatabase } from '../index';
import type { HeartbeatStatus, PowerStatus, Server } from '../schema';

export class ServersRepository {
  private db: Database;

  constructor(db?: Database) {
    this.db = db ?? getDatabase();
  }

  /**
   * サーバー一覧取得
   */
  findAll(): Server[] {
    return this.db
      .query('SELECT * FROM servers ORDER BY created_at DESC')
      .all() as Server[];
  }

  /**
   * ID でサーバー取得
   */
  findById(id: number): Server | null {
    return this.db
      .query('SELECT * FROM servers WHERE id = ?')
      .get(id) as Server | null;
  }

  /**
   * UUID でサーバー取得
   */
  findByUuid(uuid: string): Server | null {
    return this.db
      .query('SELECT * FROM servers WHERE uuid = ?')
      .get(uuid) as Server | null;
  }

  /**
   * サーバー作成
   */
  create(data: {
    uuid: string;
    name: string;
    macAddress: string;
    heartbeatInterval?: number;
  }): number {
    const result = this.db.run(
      `INSERT INTO servers (uuid, name, mac_address, heartbeat_interval)
       VALUES (?, ?, ?, ?)`,
      [data.uuid, data.name, data.macAddress, data.heartbeatInterval ?? 60],
    );
    return result.lastInsertRowid as number;
  }

  /**
   * サーバー更新
   */
  update(
    id: number,
    data: Partial<{
      name: string;
      macAddress: string;
      heartbeatInterval: number;
      powerStatus: PowerStatus;
      heartbeatStatus: HeartbeatStatus;
      previousHeartbeatStatus: HeartbeatStatus;
      lastHeartbeatAt: string | null;
      lastPowerChangedAt: string | null;
    }>,
  ): boolean {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.macAddress !== undefined) {
      updates.push('mac_address = ?');
      values.push(data.macAddress);
    }
    if (data.heartbeatInterval !== undefined) {
      updates.push('heartbeat_interval = ?');
      values.push(data.heartbeatInterval);
    }
    if (data.powerStatus !== undefined) {
      updates.push('power_status = ?');
      values.push(data.powerStatus);
    }
    if (data.heartbeatStatus !== undefined) {
      updates.push('heartbeat_status = ?');
      values.push(data.heartbeatStatus);
    }
    if (data.previousHeartbeatStatus !== undefined) {
      updates.push('previous_heartbeat_status = ?');
      values.push(data.previousHeartbeatStatus);
    }
    if (data.lastHeartbeatAt !== undefined) {
      updates.push('last_heartbeat_at = ?');
      values.push(data.lastHeartbeatAt);
    }
    if (data.lastPowerChangedAt !== undefined) {
      updates.push('last_power_changed_at = ?');
      values.push(data.lastPowerChangedAt);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = this.db.run(
      `UPDATE servers SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );

    return result.changes > 0;
  }

  /**
   * 電源ステータス更新
   */
  updatePowerStatus(id: number, powerStatus: PowerStatus): boolean {
    const result = this.db.run(
      `UPDATE servers 
       SET power_status = ?, 
           last_power_changed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [powerStatus, id],
    );
    return result.changes > 0;
  }

  /**
   * ハートビートステータス更新
   */
  updateHeartbeatStatus(id: number, heartbeatStatus: HeartbeatStatus): boolean {
    const result = this.db.run(
      `UPDATE servers 
       SET previous_heartbeat_status = heartbeat_status,
           heartbeat_status = ?,
           last_heartbeat_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [heartbeatStatus, id],
    );
    return result.changes > 0;
  }

  /**
   * サーバー削除
   */
  delete(id: number): boolean {
    const result = this.db.run('DELETE FROM servers WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
