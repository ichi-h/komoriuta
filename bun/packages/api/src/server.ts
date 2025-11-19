/**
 * Fastifyサーバーインスタンス設定
 */

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { initDatabase } from './db';
import { errorHandler } from './middleware/error';
import { registerAuthRoutes } from './routes/auth';
import { registerConnectRoutes } from './routes/connect';
import { getEnv } from './utils/env';

export async function createServer(): Promise<FastifyInstance> {
  const { ALLOWED_ORIGIN, COOKIE_SECRET } = getEnv();

  const server = Fastify({
    logger: false, // カスタムロガーを使用
  });

  // データベース初期化
  await initDatabase();

  // ミドルウェア設定
  await server.register(cors as never, {
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow: boolean) => void,
    ) => {
      // 同一オリジンのみ許可
      const allowedOrigins = [ALLOWED_ORIGIN];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
    credentials: true,
  });

  await server.register(cookie as never, {
    secret: COOKIE_SECRET,
  });

  // エラーハンドリング
  server.setErrorHandler(errorHandler);

  // ルート登録
  await registerAuthRoutes(server);
  await registerConnectRoutes(server);

  return server;
}
