/**
 * セッションストア
 * インメモリ実装（将来的にRedis等に切り替え可能）
 */

export interface Session {
  userId: string;
  expiresAt: number;
}

export interface ISessionStore {
  create(userId: string, maxAge: number): string;
  get(sessionId: string): Session | null;
  delete(sessionId: string): void;
  cleanup(): void;
}

/**
 * インメモリセッションストア実装
 */
export class InMemorySessionStore implements ISessionStore {
  private sessions = new Map<string, Session>();

  /**
   * セッションを作成
   */
  create(userId: string, maxAge: number): string {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + maxAge * 1000;

    this.sessions.set(sessionId, { userId, expiresAt });

    return sessionId;
  }

  /**
   * セッションを取得
   */
  get(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    // 有効期限チェック
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * セッションを削除
   */
  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 期限切れセッションをクリーンアップ
   */
  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// シングルトンインスタンス
export const sessionStore = new InMemorySessionStore();

// 定期的にクリーンアップ（1時間ごと）
setInterval(() => {
  sessionStore.cleanup();
}, 3600000);
