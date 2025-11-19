/**
 * Backendサーバー起動
 */

import { createServer } from './server';
import { startHeartbeatMonitoring } from './services/heartbeat';
import { logger } from './utils/logger';

const BACKEND_PORT = process.env.BACKEND_PORT || 3001;
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';

export async function startBackend() {
  const server = await createServer();

  // ハートビート監視を開始
  startHeartbeatMonitoring();

  await server.listen({
    port: Number(BACKEND_PORT),
    host: BACKEND_HOST,
  });

  const url = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

  logger.info({
    type: 'startup',
    message: `Backend server started on ${url}`,
  });

  return { server, url };
}
