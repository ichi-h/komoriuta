/**
 * Web Server (Frontend + Proxy)
 * Bun Serve
 * フロントエンド配信 + APIプロキシ
 */

import { serve } from 'bun';
import indexHtml from './frontend/index.html';
import { enforceHttps } from './middleware/middleware';
import { getEnv } from './utils/env';
import { logger } from './utils/logger';

const { WEB_PORT, WEB_HOST, API_URL, FRONTEND_DEV_MODE } = getEnv();

serve({
  port: WEB_PORT,
  hostname: WEB_HOST,

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
      const backendRequestUrl = new URL(url.pathname + url.search, API_URL);

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
  message: `Web server started on http://${WEB_HOST}:${WEB_PORT}`,
  context: {
    apiUrl: API_URL,
    devMode: FRONTEND_DEV_MODE,
  },
});

console.log(`🚀 Web server running at http://${WEB_HOST}:${WEB_PORT}`);
