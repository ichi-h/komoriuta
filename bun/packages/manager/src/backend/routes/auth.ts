/**
 * 認証APIルーティング
 */

import type { FastifyInstance } from 'fastify';
import {
  createSession,
  isBlocked,
  recordLoginAttempt,
} from '../middleware/auth';
import { verifyPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';
import { logger } from '../utils/logger';

const { USER_ID, PASSWORD_HASH, SESSION_MAX_AGE } = getEnv();

export async function registerAuthRoutes(server: FastifyInstance) {
  // ログイン
  server.post('/api/auth/login', async (request, reply) => {
    const startTime = Date.now();
    const ipAddress = request.ip;

    // IPブロックチェック
    if (isBlocked(ipAddress)) {
      logger.warn({
        type: 'api',
        message: 'Login blocked due to too many failed attempts',
        ipAddress,
      });

      return reply.code(429).send({
        error: 'Too many login attempts. Please try again later.',
      });
    }

    const { userId, password } = request.body as {
      userId: string;
      password: string;
    };

    // 認証
    const isValid =
      userId === USER_ID && verifyPassword(password, PASSWORD_HASH);

    if (!isValid) {
      recordLoginAttempt(ipAddress, false);

      logger.info({
        type: 'api',
        procedure: 'login',
        ipAddress,
        durationMs: Date.now() - startTime,
        message: 'Login failed',
      });

      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // セッション作成
    recordLoginAttempt(ipAddress, true);
    const sessionId = createSession(userId);

    reply.setCookie('session_id', sessionId, {
      path: '/',
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    logger.info({
      type: 'api',
      procedure: 'login',
      ipAddress,
      durationMs: Date.now() - startTime,
      message: 'Login successful',
    });

    return { success: true };
  });

  // ログアウト
  server.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie('session_id');
    return { success: true };
  });
}
