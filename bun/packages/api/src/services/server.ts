/**
 * サーバー管理サービス
 */

import { AccessTokensRepository } from '../db/repositories/access-tokens';
import { ServersRepository } from '../db/repositories/servers';
import type { PowerStatus, Server } from '../db/schema';
import { withTransactionSync } from '../db/transaction';
import { generateAccessToken, hashPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';

/**
 * サーバー一覧取得
 */
export function listServers(): Server[] {
  const repo = new ServersRepository();
  return repo.findAll();
}

/**
 * サーバー詳細取得
 */
export function getServer(id: number): Server | null {
  const repo = new ServersRepository();
  return repo.findById(id);
}

/**
 * サーバー作成
 */
export function createServer(data: {
  name: string;
  macAddress: string;
  heartbeatInterval?: number;
}): { server: Server; accessToken: string } {
  const uuid = crypto.randomUUID();
  const accessToken = generateAccessToken();
  const tokenHash = hashPassword(accessToken);

  // トランザクション内でサーバーとトークンを作成
  const serverId = withTransactionSync((db) => {
    const serversRepo = new ServersRepository(db);
    const tokensRepo = new AccessTokensRepository(db);

    // サーバー作成
    const id = serversRepo.create({
      uuid,
      name: data.name,
      macAddress: data.macAddress,
      heartbeatInterval: data.heartbeatInterval ?? 60,
    });

    // アクセストークン作成
    const { TOKEN_EXPIRES_SECONDS } = getEnv();
    const expiresAt =
      TOKEN_EXPIRES_SECONDS === 0
        ? null
        : new Date(Date.now() + TOKEN_EXPIRES_SECONDS * 1000).toISOString();

    tokensRepo.create({
      serverId: id,
      tokenHash,
      expiresAt,
    });

    return id;
  });

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
  const repo = new ServersRepository();
  repo.update(id, data);
  return repo.findById(id);
}

/**
 * サーバー削除
 */
export function deleteServer(id: number): boolean {
  const repo = new ServersRepository();
  return repo.delete(id);
}

/**
 * 電源ステータス更新
 */
export function updatePowerStatus(
  id: number,
  powerStatus: PowerStatus,
): Server | null {
  const repo = new ServersRepository();
  repo.updatePowerStatus(id, powerStatus);
  return repo.findById(id);
}
