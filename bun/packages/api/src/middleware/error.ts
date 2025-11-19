/**
 * エラーハンドリングミドルウェア
 */

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  logger.error({
    type: 'error',
    message: error.message,
    stackTrace: error.stack,
    context: {
      method: request.method,
      url: request.url,
      statusCode: error.statusCode,
    },
  });

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Internal Server Error' : error.message;

  reply.code(statusCode).send({
    error: message,
    statusCode,
  });
}
