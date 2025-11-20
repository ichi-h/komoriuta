/**
 * レート制限ミドルウェア
 * IPアドレスベースのログイン試行回数制限
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { rateLimiter } from '../infrastructure/rate-limiter';

/**
 * レート制限チェックミドルウェア
 * ログインエンドポイントに適用
 */
export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const ipAddress = request.ip;

  if (rateLimiter.isBlocked(ipAddress)) {
    reply.code(429).send({
      error: 'Too many login attempts. Please try again later.',
    });
  }
}
