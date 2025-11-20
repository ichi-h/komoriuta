/**
 * レート制限ストア
 * IPアドレスベースのログイン試行回数制限
 */

export interface LoginAttempt {
  count: number;
  blockedUntil: number;
}

export interface IRateLimiter {
  recordAttempt(ipAddress: string, success: boolean): void;
  isBlocked(ipAddress: string): boolean;
  cleanup(): void;
}

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 600000; // 10分（ミリ秒）

/**
 * インメモリレート制限ストア実装
 */
export class InMemoryRateLimiter implements IRateLimiter {
  private attempts = new Map<string, LoginAttempt>();

  /**
   * ログイン試行を記録
   */
  recordAttempt(ipAddress: string, success: boolean): void {
    const attempt = this.attempts.get(ipAddress) || {
      count: 0,
      blockedUntil: 0,
    };

    if (success) {
      // 成功時はリセット
      this.attempts.delete(ipAddress);
      return;
    }

    // 失敗時はカウント増加
    attempt.count++;

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.blockedUntil = Date.now() + BLOCK_DURATION;
    }

    this.attempts.set(ipAddress, attempt);
  }

  /**
   * IPアドレスがブロックされているか確認
   */
  isBlocked(ipAddress: string): boolean {
    const attempt = this.attempts.get(ipAddress);

    if (!attempt) return false;

    // ブロック期限切れの場合はクリア
    if (Date.now() > attempt.blockedUntil) {
      this.attempts.delete(ipAddress);
      return false;
    }

    return attempt.blockedUntil > 0;
  }

  /**
   * 期限切れエントリをクリーンアップ
   */
  cleanup(): void {
    const now = Date.now();
    for (const [ipAddress, attempt] of this.attempts.entries()) {
      if (attempt.blockedUntil > 0 && now > attempt.blockedUntil) {
        this.attempts.delete(ipAddress);
      }
    }
  }
}

// シングルトンインスタンス
export const rateLimiter = new InMemoryRateLimiter();

// 定期的にクリーンアップ（1時間ごと）
setInterval(() => {
  rateLimiter.cleanup();
}, 3600000);
