/**
 * サーバー管理サービス
 */

import { getDatabase } from '../db';
import type { PowerStatus, Server } from '../db/schema';
import { generateAccessToken, hashPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';

/**
 * サーバー一覧取得
 */
export function listServers(): Server[] {
  const db = getDatabase();
  return db
    .query('SELECT * FROM servers ORDER BY created_at DESC')
    .all() as Server[];
}

/**
 * サーバー詳細取得
 */
export function getServer(id: number): Server | null {
  const db = getDatabase();
  return db
    .query('SELECT * FROM servers WHERE id = ?')
    .get(id) as Server | null;
}

/**
 * サーバー作成
 */
export function createServer(data: {
  name: string;
  macAddress: string;
  heartbeatInterval?: number;
}): { server: Server; accessToken: string } {
  const db = getDatabase();
  const uuid = crypto.randomUUID();
  const accessToken = generateAccessToken();
  const tokenHash = hashPassword(accessToken);

  // サーバー作成
  const result = db.run(
    `INSERT INTO servers (uuid, name, mac_address, heartbeat_interval)
     VALUES (?, ?, ?, ?)`,
    [uuid, data.name, data.macAddress, data.heartbeatInterval || 60],
  );

  const serverId = result.lastInsertRowid as number;

  // アクセストークン作成
  const { TOKEN_EXPIRES_SECONDS } = getEnv();
  const expiresAt =
    TOKEN_EXPIRES_SECONDS === 0
      ? null
      : new Date(Date.now() + TOKEN_EXPIRES_SECONDS * 1000).toISOString();

  db.run(
    `INSERT INTO access_tokens (server_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [serverId, tokenHash, expiresAt],
  );

  const server = getServer(serverId);
  if (!server) {
    throw new Error('Failed to create server');
  }

  return { server, accessToken };
}

/**
 * サーバー更新
 */
export function updateServer(
  id: number,
  data: Partial<{
    name: string;
    macAddress: string;
    heartbeatInterval: number;
  }>,
): Server | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number)[] = [];

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

  if (updates.length === 0) return getServer(id);

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.run(`UPDATE servers SET ${updates.join(', ')} WHERE id = ?`, values);

  return getServer(id);
}

/**
 * サーバー削除
 */
export function deleteServer(id: number): boolean {
  const db = getDatabase();
  const result = db.run('DELETE FROM servers WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * 電源ステータス更新
 */
export function updatePowerStatus(
  id: number,
  powerStatus: PowerStatus,
): Server | null {
  const db = getDatabase();

  db.run(
    `UPDATE servers 
     SET power_status = ?, 
         last_power_changed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [powerStatus, id],
  );

  return getServer(id);
}
