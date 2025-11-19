/**
 * Proxyサーバー
 * BackendとFrontendへのルーティングを行う
 */

import { serve } from 'bun';
import { getEnv } from '../backend/utils/env';
import { logger } from '../backend/utils/logger';
import { handleRequest } from './router';

const { PORT, HOST } = getEnv();

export async function startProxy() {
  const server = serve({
    port: PORT,
    hostname: HOST,
    async fetch(request: Request) {
      return handleRequest(request);
    },
  });

  logger.info({
    type: 'startup',
    message: `komo-manager started on ${HOST}:${PORT}`,
  });

  return server;
}
