/**
 * レート制限ストアのテスト
 */

import { beforeEach, describe, expect, test } from 'bun:test';
import { InMemoryRateLimiter } from '../rate-limiter';

describe('InMemoryRateLimiter', () => {
  let limiter: InMemoryRateLimiter;

  beforeEach(() => {
    limiter = new InMemoryRateLimiter();
  });

  describe('recordAttempt', () => {
    test('失敗を記録できる', () => {
      const ipAddress = '192.168.1.1';

      limiter.recordAttempt(ipAddress, false);

      expect(limiter.isBlocked(ipAddress)).toBe(false);
    });

    test('成功を記録すると失敗カウントがリセットされる', () => {
      const ipAddress = '192.168.1.1';

      // 3回失敗
      limiter.recordAttempt(ipAddress, false);
      limiter.recordAttempt(ipAddress, false);
      limiter.recordAttempt(ipAddress, false);

      // 成功でリセット
      limiter.recordAttempt(ipAddress, true);

      // ブロックされていない
      expect(limiter.isBlocked(ipAddress)).toBe(false);
    });

    test('5回失敗するとブロックされる', () => {
      const ipAddress = '192.168.1.1';

      // 5回失敗
      for (let i = 0; i < 5; i++) {
        limiter.recordAttempt(ipAddress, false);
      }

      expect(limiter.isBlocked(ipAddress)).toBe(true);
    });

    test('異なるIPアドレスは独立してカウントされる', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // ip1で5回失敗
      for (let i = 0; i < 5; i++) {
        limiter.recordAttempt(ip1, false);
      }

      // ip1はブロック、ip2はブロックされていない
      expect(limiter.isBlocked(ip1)).toBe(true);
      expect(limiter.isBlocked(ip2)).toBe(false);
    });
  });

  describe('isBlocked', () => {
    test('記録のないIPアドレスはブロックされていない', () => {
      expect(limiter.isBlocked('192.168.1.1')).toBe(false);
    });

    test('5回未満の失敗ではブロックされない', () => {
      const ipAddress = '192.168.1.1';

      for (let i = 0; i < 4; i++) {
        limiter.recordAttempt(ipAddress, false);
      }

      expect(limiter.isBlocked(ipAddress)).toBe(false);
    });

    test('ブロック期限が切れたらブロック解除される', () => {
      const ipAddress = '192.168.1.1';

      // 5回失敗してブロック
      for (let i = 0; i < 5; i++) {
        limiter.recordAttempt(ipAddress, false);
      }

      expect(limiter.isBlocked(ipAddress)).toBe(true);

      // ブロック期限を過去に設定（直接Mapを操作）
      // @ts-expect-error - テストのためprivateフィールドにアクセス
      limiter.attempts.set(ipAddress, {
        count: 5,
        blockedUntil: Date.now() - 1000, // 過去の時刻
      });

      // ブロック解除される
      expect(limiter.isBlocked(ipAddress)).toBe(false);

      // エントリも削除される
      // @ts-expect-error - テストのためprivateフィールドにアクセス
      expect(limiter.attempts.has(ipAddress)).toBe(false);
    });
  });

  describe('cleanup', () => {
    test('期限切れエントリのみをクリーンアップする', () => {
      const validIp = '192.168.1.1';
      const expiredIp = '192.168.1.2';

      // validIpは現在ブロック中
      for (let i = 0; i < 5; i++) {
        limiter.recordAttempt(validIp, false);
      }

      // expiredIpは期限切れ（直接Mapに追加）
      // @ts-expect-error - テストのためprivateフィールドにアクセス
      limiter.attempts.set(expiredIp, {
        count: 5,
        blockedUntil: Date.now() - 1000, // 過去の時刻
      });

      limiter.cleanup();

      // validIpは残る
      expect(limiter.isBlocked(validIp)).toBe(true);

      // expiredIpは削除される
      // @ts-expect-error - テストのためprivateフィールドにアクセス
      expect(limiter.attempts.has(expiredIp)).toBe(false);
    });

    test('空のストアでクリーンアップしてもエラーにならない', () => {
      expect(() => {
        limiter.cleanup();
      }).not.toThrow();
    });
  });
});
