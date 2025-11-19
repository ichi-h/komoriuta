/**
 * Proxyサーバー
 * BackendとFrontendへのルーティングを行う
 */

import { serve } from 'bun';
import { logger } from '../backend/utils/logger';
import { handleRequest } from './router';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

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
