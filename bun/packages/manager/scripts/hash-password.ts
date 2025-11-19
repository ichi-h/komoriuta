#!/usr/bin/env bun

/**
 * パスワードハッシュ生成スクリプト
 *
 * 使用方法:
 *   bun run scripts/hash-password.ts <password>
 *
 * 例:
 *   bun run scripts/hash-password.ts mySecurePassword123
 */

import { hashPassword } from '../src/backend/utils/crypto';

const password = process.argv[2];

if (!password) {
  console.error('エラー: パスワードを指定してください');
  console.error('使用方法: bun run scripts/hash-password.ts <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('警告: パスワードが短すぎます。8文字以上を推奨します。');
}

try {
  const hash = hashPassword(password);
  console.log('\n生成されたパスワードハッシュ:');
  console.log(hash);
  console.log('\n.envファイルに以下のように設定してください:');
  console.log(`PASSWORD_HASH=${hash}`);
} catch (error) {
  console.error('エラー: パスワードハッシュの生成に失敗しました');
  console.error(error);
  process.exit(1);
}
