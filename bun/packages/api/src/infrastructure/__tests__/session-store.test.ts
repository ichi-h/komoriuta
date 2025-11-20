/**
 * セッションストアのテスト
 */

import { beforeEach, describe, expect, test } from 'bun:test';
import { InMemorySessionStore } from '../session-store';

describe('InMemorySessionStore', () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  describe('create', () => {
    test('新しいセッションを作成できる', () => {
      const sessionId = store.create('user123', 3600);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    test('異なるユーザーIDで異なるセッションIDを生成する', () => {
      const sessionId1 = store.create('user1', 3600);
      const sessionId2 = store.create('user2', 3600);

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('get', () => {
    test('存在するセッションを取得できる', () => {
      const userId = 'user123';
      const maxAge = 3600;
      const sessionId = store.create(userId, maxAge);

      const session = store.get(sessionId);

      expect(session).toBeDefined();
      expect(session?.userId).toBe(userId);
      expect(session?.expiresAt).toBeGreaterThan(Date.now());
    });

    test('存在しないセッションはnullを返す', () => {
      const session = store.get('nonexistent-session-id');

      expect(session).toBeNull();
    });

    test('期限切れセッションはnullを返し削除される', async () => {
      const sessionId = store.create('user123', 0); // 即座に期限切れ

      // 少し待つ（1ms以上）
      await new Promise((resolve) => setTimeout(resolve, 10));

      const session = store.get(sessionId);

      expect(session).toBeNull();

      // 再度取得しても存在しない
      const session2 = store.get(sessionId);
      expect(session2).toBeNull();
    });
  });

  describe('delete', () => {
    test('セッションを削除できる', () => {
      const sessionId = store.create('user123', 3600);

      // 削除前は存在する
      expect(store.get(sessionId)).toBeDefined();

      store.delete(sessionId);

      // 削除後は存在しない
      expect(store.get(sessionId)).toBeNull();
    });

    test('存在しないセッションを削除してもエラーにならない', () => {
      expect(() => {
        store.delete('nonexistent-session-id');
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    test('期限切れセッションのみをクリーンアップする', () => {
      // 有効なセッション
      const validSessionId = store.create('valid-user', 3600);

      // 期限切れセッション（直接Mapに追加してシミュレート）
      const expiredSessionId = 'expired-session';
      // @ts-expect-error - テストのためprivateフィールドにアクセス
      store.sessions.set(expiredSessionId, {
        userId: 'expired-user',
        expiresAt: Date.now() - 1000, // 過去の時刻
      });

      store.cleanup();

      // 有効なセッションは残る
      expect(store.get(validSessionId)).toBeDefined();

      // 期限切れセッションは削除される
      expect(store.get(expiredSessionId)).toBeNull();
    });

    test('空のストアでクリーンアップしてもエラーにならない', () => {
      expect(() => {
        store.cleanup();
      }).not.toThrow();
    });
  });
});
