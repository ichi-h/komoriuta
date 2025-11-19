/**
 * 認証サービス
 */

import { hashPassword, verifyPassword } from '../utils/crypto';
import { getEnv } from '../utils/env';

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
