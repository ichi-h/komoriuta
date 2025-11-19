/**
 * ルーティングロジック
 * リクエストをBackendまたはFrontendに振り分ける
 */

import { startBackend } from '../backend';

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

/**
 * リクエストをルーティング
 */
export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // APIリクエストの場合、Backendへプロキシ
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/komoriuta.v1.')
  ) {
    const backend = await initBackend();
    const backendUrl = new URL(url.pathname + url.search, backend);

    return fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // その他のリクエストはFrontendを返す
  // TODO: フロントエンドの静的ファイル配信を実装
  return new Response('Frontend placeholder', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
