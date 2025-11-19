/**
 * 暗号化ユーティリティ
 * scryptを使用したパスワード・トークンのハッシュ化
 */

import { randomBytes, scryptSync } from 'node:crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 16384, // CPU/メモリコスト
  r: 8, // ブロックサイズ
  p: 1, // 並列化
};

/**
 * パスワードまたはトークンをscryptでハッシュ化
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

  // salt:hash の形式で保存
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * パスワードまたはトークンを検証
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const hash = scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

  const storedHashBuffer = Buffer.from(hashHex, 'hex');
  return hash.equals(storedHashBuffer);
}

/**
 * ランダムなアクセストークンを生成（32文字の大小英数字）
 */
export function generateAccessToken(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(32);
  let token = '';

  for (let i = 0; i < 32; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      token += chars[byte % chars.length];
    }
  }

  return token;
}
