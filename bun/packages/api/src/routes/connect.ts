/**
 * Connect APIハンドラー
 * Protocol Buffersで定義されたAPIのハンドラーを登録
 */

import type { LoginRequest } from '@komo-manager/connect/komoriuta/v1/auth_pb';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import * as authService from '../services/auth';
import { logger } from '../utils/logger';

export async function registerConnectRoutes(server: FastifyInstance) {
  // ========================================
  // 認証API (AuthService)
  // ========================================

  // POST /komoriuta.v1.AuthService/Login
  server.post(
    '/komoriuta.v1.AuthService/Login',
    {
      preHandler: rateLimitMiddleware,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const req = request.body as LoginRequest;

      const result = authService.login(req.userId, req.password, request.ip);

      if (!result.success) {
        logger.info({
          type: 'connect',
          procedure: 'Login',
          message: 'Login failed',
          userId: req.userId,
        });

        return reply.send({
          success: false,
          errorMessage: result.errorMessage,
        });
      }

      if (!result.sessionId) {
        return reply.send({
          success: false,
          errorMessage: 'Failed to create session',
        });
      }

      // セッションCookie設定
      reply.setCookie(
        'session_id',
        result.sessionId,
        authService.getSessionCookieOptions(),
      );

      logger.info({
        type: 'connect',
        procedure: 'Login',
        message: 'Login successful',
        userId: req.userId,
      });

      return reply.send({
        success: true,
      });
    },
  );

  // POST /komoriuta.v1.AuthService/Verify
  server.post(
    '/komoriuta.v1.AuthService/Verify',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = request.cookies?.session_id;

      logger.info({
        type: 'connect',
        procedure: 'Verify',
        message: 'Verify request received',
      });

      const result = authService.verify(sessionId);

      return reply.send(result);
    },
  );

  // POST /komoriuta.v1.AuthService/Logout
  server.post(
    '/komoriuta.v1.AuthService/Logout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = request.cookies?.session_id;

      logger.info({
        type: 'connect',
        procedure: 'Logout',
        message: 'Logout request received',
      });

      reply.clearCookie('session_id');

      const result = authService.logout(sessionId);

      return reply.send(result);
    },
  );

  logger.info({
    type: 'startup',
    message: 'Connect API routes registered',
  });
}
