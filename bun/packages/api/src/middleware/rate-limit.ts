/**
 * レート制限ミドルウェア
 * IPアドレスベースのログイン試行回数制限
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRateLimiter } from '../infrastructure/rate-limiter';
import { rateLimiter } from '../infrastructure/rate-limiter';

/**
 * レート制限ミドルウェアを作成するファクトリ関数
 */
export const createRateLimitMiddleware = (limiter: IRateLimiter) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ipAddress = request.ip;

    if (limiter.isBlocked(ipAddress)) {
      return reply.code(429).send({
        error: 'Too many login attempts. Please try again later.',
      });
    }
  };
};

/**
 * デフォルトのレート制限ミドルウェア
 */
export const rateLimitMiddleware = createRateLimitMiddleware(rateLimiter);
