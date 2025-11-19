/**
 * Proxyサーバー
 * BackendとFrontendへのルーティングを行う
 */

import { serve } from 'bun';
import { startBackend } from '../backend';
import { getEnv } from '../backend/utils/env';
import { logger } from '../backend/utils/logger';
import indexHtml from '../frontend/index.html';
import { enforceHttps } from './middleware';

const { PORT, HOST, FRONTEND_DEV_MODE } = getEnv();

let backendUrl: string | null = null;

/**
 * バックエンドサーバーを初期化
 */
async function initBackend() {
  if (!backendUrl) {
    const { url } = await startBackend();
    backendUrl = url;
  }
  return backendUrl;
}

export async function startProxy() {
  // バックエンドを初期化
  await initBackend();

  const server = serve({
    port: PORT,
    hostname: HOST,

    // ルーティング設定
    routes: {
      // すべてのルートでindex.htmlを配信（SPAとして動作）
      '/*': indexHtml,
    },

    // 開発モード設定
    development: FRONTEND_DEV_MODE && {
      hmr: true, // ホットリロード有効化
      console: true, // ブラウザのコンソールログをサーバーに出力
    },

    // カスタムハンドラー（APIリクエストをバックエンドへプロキシ）
    async fetch(request: Request) {
      // HTTPS強制チェック（localhost以外）
      const httpsRedirect = enforceHttps(request);
      if (httpsRedirect) {
        return httpsRedirect;
      }

      const url = new URL(request.url);

      // APIリクエストの場合、Backendへプロキシ
      if (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/komoriuta.v1.')
      ) {
        if (!backendUrl) {
          return new Response('Backend not initialized', { status: 503 });
        }

        const backendRequestUrl = new URL(
          url.pathname + url.search,
          backendUrl,
        );

        return fetch(backendRequestUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      }

      // その他のリクエストはデフォルトのルーティング（routes）に任せる
      // Bunが自動的にindex.htmlやその他のアセットを配信
      return new Response(null);
    },
  });

  logger.info({
    type: 'startup',
    message: `komo-manager started on http://${HOST}:${PORT}`,
  });

  return server;
}
