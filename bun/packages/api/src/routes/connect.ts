/**
 * Connect APIハンドラー
 * Protocol Buffersで定義されたAPIのハンドラーを登録
 */

import type { LoginRequest } from '@komo-manager/connect/komoriuta/v1/auth_pb';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export async function registerConnectRoutes(server: FastifyInstance) {
  // Connect RPCエンドポイントを手動で登録
  // POST /komoriuta.v1.AuthService/Login
  server.post(
    '/komoriuta.v1.AuthService/Login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const req = request.body as LoginRequest;

      logger.info({
        type: 'connect',
        message: 'Login request received',
        userId: req.userId,
      });

      return reply.send({
        success: false,
        errorMessage: 'Login not implemented yet',
        failedAttempts: 0,
      });
    },
  );

  // POST /komoriuta.v1.AuthService/Verify
  server.post(
    '/komoriuta.v1.AuthService/Verify',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      logger.info({
        type: 'connect',
        message: 'Verify request received',
      });

      return reply.send({
        authenticated: false,
      });
    },
  );

  // POST /komoriuta.v1.AuthService/Logout
  server.post(
    '/komoriuta.v1.AuthService/Logout',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      logger.info({
        type: 'connect',
        message: 'Logout request received',
      });

      return reply.send({
        success: true,
      });
    },
  );

  logger.info({
    type: 'startup',
    message: 'Connect API routes registered (manual)',
  });
}
