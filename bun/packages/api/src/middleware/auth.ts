/**
 * 認証ミドルウェア
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { AccessTokensRepository } from '../db/repositories/access-tokens';
import { ServersRepository } from '../db/repositories/servers';
import { verifyPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';

// セッション管理(インメモリ)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// ログイン失敗管理(インメモリ)
const loginAttempts = new Map<
  string,
  { count: number; blockedUntil: number }
>();

const { SESSION_MAX_AGE } = getEnv();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 600000; // 10分（ミリ秒）

/**
 * セッションを作成
 */
export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  sessions.set(sessionId, { userId, expiresAt });

  return sessionId;
}

/**
 * セッションを検証
 */
export function verifySession(sessionId: string): string | null {
  const session = sessions.get(sessionId);

  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session.userId;
}

/**
 * ログイン試行を記録
 */
export function recordLoginAttempt(ipAddress: string, success: boolean) {
  const attempt = loginAttempts.get(ipAddress) || { count: 0, blockedUntil: 0 };

  if (success) {
    loginAttempts.delete(ipAddress);
    return;
  }

  attempt.count++;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.blockedUntil = Date.now() + BLOCK_DURATION;
  }

  loginAttempts.set(ipAddress, attempt);
}

/**
 * IPアドレスがブロックされているか確認
 */
export function isBlocked(ipAddress: string): boolean {
  const attempt = loginAttempts.get(ipAddress);

  if (!attempt) return false;
  if (Date.now() > attempt.blockedUntil) {
    loginAttempts.delete(ipAddress);
    return false;
  }

  return attempt.blockedUntil > 0;
}

/**
 * 認証が必要なエンドポイント用ミドルウェア
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies?.session_id;

  if (!sessionId || !verifySession(sessionId)) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

/**
 * Bearer Token認証（Agent用）
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
 */
export async function agentAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return reply
      .code(401)
      .send({ error: 'Missing or invalid authorization header' });
  }

  const serverId = await verifyAccessToken(token);

  if (!serverId) {
    return reply.code(401).send({ error: 'Invalid or expired access token' });
  }

  // リクエストにサーバーIDを追加
  request.serverId = serverId;
}
