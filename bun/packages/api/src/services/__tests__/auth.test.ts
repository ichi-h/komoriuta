/**
 * 認証サービスのテスト
 */

import { beforeEach, describe, expect, test } from 'bun:test';
import type { IRateLimiter } from '../../infrastructure/rate-limiter';
import type { ISessionStore } from '../../infrastructure/session-store';
import * as authService from '../auth';

// モックセッションストア
class MockSessionStore implements ISessionStore {
  private sessions = new Map<string, { userId: string; expiresAt: number }>();
  private sessionIdCounter = 0;

  create(userId: string, maxAge: number): string {
    const sessionId = `mock-session-${++this.sessionIdCounter}`;
    this.sessions.set(sessionId, {
      userId,
      expiresAt: Date.now() + maxAge * 1000,
    });
    return sessionId;
  }

  get(sessionId: string) {
    return this.sessions.get(sessionId) || null;
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanup(): void {
    // No-op for mock
  }
}

// モックレート制限
class MockRateLimiter implements IRateLimiter {
  public attempts = new Map<string, { count: number; blockedUntil: number }>();

  recordAttempt(ipAddress: string, success: boolean): void {
    if (success) {
      this.attempts.delete(ipAddress);
    } else {
      const attempt = this.attempts.get(ipAddress) || {
        count: 0,
        blockedUntil: 0,
      };
      attempt.count++;
      this.attempts.set(ipAddress, attempt);
    }
  }

  isBlocked(_ipAddress: string): boolean {
    return false;
  }

  cleanup(): void {
    // No-op for mock
  }
}

describe('authService', () => {
  let mockStore: MockSessionStore;
  let mockLimiter: MockRateLimiter;
  const TEST_USER_ID = 'testuser';
  const TEST_PASSWORD = 'testpass';

  beforeEach(() => {
    mockStore = new MockSessionStore();
    mockLimiter = new MockRateLimiter();

    // テスト用の環境変数を設定
    process.env.USER_ID = TEST_USER_ID;
    process.env.PASSWORD_HASH = authService.createPasswordHash(TEST_PASSWORD);
  });

  describe('login', () => {
    test('正しい認証情報でログインに成功する', () => {
      const result = authService.login(
        TEST_USER_ID,
        TEST_PASSWORD,
        '192.168.1.1',
        mockStore,
        mockLimiter,
      );

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.errorMessage).toBeUndefined();
    });

    test('間違ったユーザーIDでログインに失敗する', () => {
      const result = authService.login(
        'wrong-user',
        TEST_PASSWORD,
        '192.168.1.1',
        mockStore,
        mockLimiter,
      );

      expect(result.success).toBe(false);
      expect(result.sessionId).toBeUndefined();
      expect(result.errorMessage).toBe('Invalid credentials');
    });

    test('間違ったパスワードでログインに失敗する', () => {
      const result = authService.login(
        TEST_USER_ID,
        'wrong-password',
        '192.168.1.1',
        mockStore,
        mockLimiter,
      );

      expect(result.success).toBe(false);
      expect(result.sessionId).toBeUndefined();
      expect(result.errorMessage).toBe('Invalid credentials');
    });

    test('ログイン失敗時にレート制限が記録される', () => {
      const ipAddress = '192.168.1.1';

      authService.login(
        'wrong-user',
        'wrong-password',
        ipAddress,
        mockStore,
        mockLimiter,
      );

      expect(mockLimiter.attempts.get(ipAddress)?.count).toBe(1);
    });

    test('ログイン成功時にレート制限がリセットされる', () => {
      const ipAddress = '192.168.1.1';

      // 先に失敗を記録
      mockLimiter.recordAttempt(ipAddress, false);
      expect(mockLimiter.attempts.get(ipAddress)?.count).toBe(1);

      // 成功でリセット
      authService.login(
        TEST_USER_ID,
        TEST_PASSWORD,
        ipAddress,
        mockStore,
        mockLimiter,
      );

      expect(mockLimiter.attempts.has(ipAddress)).toBe(false);
    });
  });

  describe('verify', () => {
    test('有効なセッションIDで認証される', () => {
      const sessionId = mockStore.create('user123', 3600);

      const result = authService.verify(sessionId, mockStore);

      expect(result.authenticated).toBe(true);
      expect(result.userId).toBe('user123');
    });

    test('無効なセッションIDで認証されない', () => {
      const result = authService.verify('invalid-session-id', mockStore);

      expect(result.authenticated).toBe(false);
      expect(result.userId).toBeUndefined();
    });

    test('セッションIDがundefinedで認証されない', () => {
      const result = authService.verify(undefined, mockStore);

      expect(result.authenticated).toBe(false);
      expect(result.userId).toBeUndefined();
    });
  });

  describe('logout', () => {
    test('有効なセッションIDでログアウトできる', () => {
      const sessionId = mockStore.create('user123', 3600);

      const result = authService.logout(sessionId, mockStore);

      expect(result.success).toBe(true);
      expect(mockStore.get(sessionId)).toBeNull();
    });

    test('セッションIDがundefinedでもエラーにならない', () => {
      const result = authService.logout(undefined, mockStore);

      expect(result.success).toBe(true);
    });
  });

  describe('authenticateUser', () => {
    test('正しいユーザーIDとパスワードで認証される', () => {
      const result = authService.authenticateUser(TEST_USER_ID, TEST_PASSWORD);

      expect(result).toBe(true);
    });

    test('間違ったユーザーIDで認証されない', () => {
      const result = authService.authenticateUser('wrong-user', TEST_PASSWORD);

      expect(result).toBe(false);
    });
  });

  describe('getSessionCookieOptions', () => {
    test('正しいCookieオプションを返す', () => {
      const options = authService.getSessionCookieOptions();

      expect(options.path).toBe('/');
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('strict');
      expect(typeof options.maxAge).toBe('number');
    });
  });
});
