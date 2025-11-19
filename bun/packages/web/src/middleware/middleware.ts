/**
 * Proxyミドルウェア
 */

/**
 * localhostかどうかを判定
 */
function isLocalhost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

/**
 * HTTPS強制（localhost以外）
 * リバースプロキシ経由を想定し、X-Forwarded-Protoヘッダーもチェック
 */
export function enforceHttps(request: Request): Response | null {
  const url = new URL(request.url);

  // localhostの場合はHTTPを許可
  if (isLocalhost(url.hostname)) {
    return null;
  }

  // X-Forwarded-Protoヘッダーをチェック（リバースプロキシ経由を想定）
  const forwardedProto = request.headers.get('X-Forwarded-Proto');
  const protocol = forwardedProto || url.protocol;

  // HTTPSでない場合はリダイレクト
  if (protocol !== 'https:') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';

    return Response.redirect(httpsUrl.toString(), 301);
  }

  return null;
}
