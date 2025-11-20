/**
 * 認証サービス
 * 純粋なビジネスロジックのみを含む
 */

import type { IRateLimiter } from '../infrastructure/rate-limiter';
import { rateLimiter } from '../infrastructure/rate-limiter';
import type { ISessionStore } from '../infrastructure/session-store';
import { sessionStore } from '../infrastructure/session-store';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';
import { logger } from '../utils/logger';

/**
 * 初期ユーザーのパスワードをハッシュ化
 * 環境変数設定用のヘルパー関数
 */
export function createPasswordHash(password: string): string {
  return hashPassword(password);
}

/**
 * ユーザー認証
 */
export function authenticateUser(userId: string, password: string): boolean {
  const { USER_ID: expectedUserId, PASSWORD_HASH: passwordHash } = getEnv();

  if (userId !== expectedUserId) return false;
  if (!passwordHash) return false;

  return verifyPassword(password, passwordHash);
}

/**
 * ログイン処理の結果
 */
export interface LoginResult {
  success: boolean;
  sessionId?: string;
  errorMessage?: string;
}

/**
 * ログイン処理
 */
export function login(
  userId: string,
  password: string,
  ipAddress: string,
  store: ISessionStore = sessionStore,
  limiter: IRateLimiter = rateLimiter,
): LoginResult {
  const startTime = Date.now();
  const { USER_ID, PASSWORD_HASH, SESSION_MAX_AGE } = getEnv();

  // 認証
  const isValid = userId === USER_ID && verifyPassword(password, PASSWORD_HASH);

  if (!isValid) {
    limiter.recordAttempt(ipAddress, false);

    logger.info({
      type: 'auth',
      procedure: 'login',
      ipAddress,
      userId,
      durationMs: Date.now() - startTime,
      message: 'Login failed',
    });

    return {
      success: false,
      errorMessage: 'Invalid credentials',
    };
  }

  // セッション作成
  limiter.recordAttempt(ipAddress, true);
  const sessionId = store.create(userId, SESSION_MAX_AGE);

  logger.info({
    type: 'auth',
    procedure: 'login',
    ipAddress,
    userId,
    durationMs: Date.now() - startTime,
    message: 'Login successful',
  });

  return {
    success: true,
    sessionId,
  };
}

/**
 * セッション検証の結果
 */
export interface VerifyResult {
  authenticated: boolean;
  userId?: string;
}

/**
 * セッション検証処理
 */
export function verify(
  sessionId: string | undefined,
  store: ISessionStore = sessionStore,
): VerifyResult {
  if (!sessionId) {
    return { authenticated: false };
  }

  const session = store.get(sessionId);

  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    userId: session.userId,
  };
}

/**
 * ログアウト処理
 */
export function logout(
  sessionId: string | undefined,
  store: ISessionStore = sessionStore,
): { success: boolean } {
  if (sessionId) {
    store.delete(sessionId);
  }

  logger.info({
    type: 'auth',
    procedure: 'logout',
    message: 'Logout successful',
  });

  return { success: true };
}

/**
 * セッションCookie設定のオプション
 */
export function getSessionCookieOptions() {
  const { SESSION_MAX_AGE } = getEnv();
  
  return {
    path: '/',
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
  };
}
