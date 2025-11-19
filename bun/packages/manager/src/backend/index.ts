/**
 * Backendサーバー起動
 */

import { createServer } from './server';
import { startHeartbeatMonitoring } from './services/heartbeat';
import { getEnv } from './utils/env';
import { logger } from './utils/logger';

const { BACKEND_PORT, BACKEND_HOST } = getEnv();

export async function startBackend() {
  const server = await createServer();

  // ハートビート監視を開始
  startHeartbeatMonitoring();

  await server.listen({
    port: BACKEND_PORT,
    host: BACKEND_HOST,
  });

  const url = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

  logger.info({
    type: 'startup',
    message: `Backend server started on ${url}`,
  });

  return { server, url };
}
