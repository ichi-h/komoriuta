/**
 * Connect RPC クライアント設定
 * フロントエンドからバックエンドAPIに直接アクセス（CORS）
 */

import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  VerifyRequest,
  VerifyResponse,
} from '@komo-manager/connect/komoriuta/v1/auth_pb';

// バックエンドAPIのURL（開発環境）
const API_BASE_URL = 'http://localhost:3001';

/**
 * Connect RPCリクエストを送信する汎用関数
 */
async function callConnectRPC<TRequest, TResponse>(
  service: string,
  method: string,
  request: TRequest,
): Promise<TResponse> {
  const response = await fetch(
    `${API_BASE_URL}/komoriuta.v1.${service}/${method}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Cookieを含める
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`RPC failed: ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}

/**
 * AuthService用のクライアント関数
 */
export const authClient = {
  /**
   * ログイン
   */
  async login(request: Partial<LoginRequest>): Promise<LoginResponse> {
    return callConnectRPC('AuthService', 'Login', request);
  },

  /**
   * 認証確認
   */
  async verify(request?: Partial<VerifyRequest>): Promise<VerifyResponse> {
    return callConnectRPC('AuthService', 'Verify', request || {});
  },

  /**
   * ログアウト
   */
  async logout(request?: Partial<LogoutRequest>): Promise<LogoutResponse> {
    return callConnectRPC('AuthService', 'Logout', request || {});
  },
};
