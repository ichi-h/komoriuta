/**
 * Web Server (Frontend)
 * フロントエンド配信専用サーバー
 */

import { serve } from 'bun';
import indexHtml from './frontend/index.html';
import { getEnv } from './utils/env';
import { logger } from './utils/logger';

const { WEB_PORT, WEB_HOST, FRONTEND_DEV_MODE } = getEnv();

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
});

logger.info({
  type: 'startup',
  message: `Web server started on http://${WEB_HOST}:${WEB_PORT}`,
  context: {
    devMode: FRONTEND_DEV_MODE,
  },
});

console.log(`🚀 Web server running at http://${WEB_HOST}:${WEB_PORT}`);
