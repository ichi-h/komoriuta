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

export async function createServer(): Promise<FastifyInstance> {
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
      const allowedOrigins = [
        process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
    credentials: true,
  });

  await server.register(cookie as never, {
    secret:
      process.env.COOKIE_SECRET || 'komoriuta-secret-key-change-in-production',
  });

  // エラーハンドリング
  server.setErrorHandler(errorHandler);

  // ルート登録
  await registerAuthRoutes(server);
  await registerConnectRoutes(server);

  return server;
}
