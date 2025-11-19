/**
 * 認証サービス
 */

import { hashPassword, verifyPassword } from '../utils/crypto';

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
  const expectedUserId = process.env.USER_ID || 'admin';
  const passwordHash = process.env.PASSWORD_HASH || '';

  if (userId !== expectedUserId) return false;
  if (!passwordHash) return false;

  return verifyPassword(password, passwordHash);
}
