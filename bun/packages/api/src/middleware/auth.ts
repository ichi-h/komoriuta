/**
 * 認証ミドルウェア
 * リクエストの認証チェックを行う
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { AccessTokensRepository } from '../db/repositories/access-tokens';
import { ServersRepository } from '../db/repositories/servers';
import { sessionStore } from '../infrastructure/session-store';
import { verifyPassword } from '../utils/crypto';

/**
 * セッション認証ミドルウェア
 * Cookie-based認証が必要なエンドポイントに適用
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const sessionId = request.cookies?.session_id;

  if (!sessionId) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  const session = sessionStore.get(sessionId);

  if (!session) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  // セッション情報をリクエストに追加
  request.userId = session.userId;
}

/**
 * Bearer Tokenを抽出
 */
export function extractBearerToken(
  authorization: string | undefined,
): string | null {
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.substring(7);
}

/**
 * アクセストークンを検証してサーバーIDを返す
 */
export async function verifyAccessToken(token: string): Promise<number | null> {
  const tokensRepo = new AccessTokensRepository();
  const serversRepo = new ServersRepository();

  // 全サーバーを取得
  const servers = serversRepo.findAll();

  for (const server of servers) {
    const accessToken = tokensRepo.findByServerId(server.id);
    if (!accessToken) continue;

    // 有効期限チェック
    if (accessToken.expires_at) {
      const expiresAt = new Date(accessToken.expires_at).getTime();
      if (Date.now() > expiresAt) continue;
    }

    // トークンハッシュ検証
    if (verifyPassword(token, accessToken.token_hash)) {
      return server.id;
    }
  }

  return null;
}

/**
 * Agent認証ミドルウェア（Bearer Token）
 * Agent APIエンドポイントに適用
 */
export async function agentAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    reply.code(401).send({ error: 'Missing or invalid authorization header' });
    return;
  }

  const serverId = await verifyAccessToken(token);

  if (!serverId) {
    reply.code(401).send({ error: 'Invalid or expired access token' });
    return;
  }

  // リクエストにサーバーIDを追加
  request.serverId = serverId;
}
