/**
 * Backendサーバー起動
 */

import { createServer } from './server';
import { startHeartbeatMonitoring } from './services/heartbeat';
import { getEnv } from './utils/env';
import { logger } from './utils/logger';

const { API_PORT, API_HOST } = getEnv();

export async function startBackend() {
  const server = await createServer();

  // ハートビート監視を開始
  startHeartbeatMonitoring();

  await server.listen({
    port: API_PORT,
    host: API_HOST,
  });

  const url = `http://${API_HOST}:${API_PORT}`;

  logger.info({
    type: 'startup',
    message: `Backend server started on ${url}`,
  });

  return { server, url };
}

// エントリーポイント
if (import.meta.main) {
  startBackend().catch((error) => {
    logger.error({
      type: 'startup_error',
      message: 'Failed to start backend server',
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}
