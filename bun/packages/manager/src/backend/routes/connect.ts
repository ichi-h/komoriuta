/**
 * Connect APIハンドラー
 * Protocol Buffersで定義されたAPIのハンドラーを登録
 */

import type { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';

export async function registerConnectRoutes(_server: FastifyInstance) {
  // TODO: Connect APIハンドラーの実装
  // @komoriuta/connectパッケージを使用してハンドラーを登録

  logger.info({
    type: 'startup',
    message: 'Connect API routes registered (placeholder)',
  });
}
