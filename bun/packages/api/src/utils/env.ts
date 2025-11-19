/**
 * API環境変数の設定とデフォルト値を定義
 */
const apiEnvConfig = {
  // API設定
  API_PORT: { default: '3001', type: 'number' as const, required: false },
  API_HOST: {
    default: '127.0.0.1',
    type: 'string' as const,
    required: false,
  },

  // 認証設定
  USER_ID: { default: 'admin', type: 'string' as const, required: false },
  PASSWORD_HASH: { default: '', type: 'string' as const, required: true },
  SESSION_MAX_AGE: {
    default: '86400',
    type: 'number' as const,
    required: false,
  }, // 24時間
  TOKEN_EXPIRES_SECONDS: {
    default: '7776000',
    type: 'number' as const,
    required: false,
  }, // 90日

  // フロントエンド設定

  // データベース設定
  DB_PATH: {
    default: './data/komoriuta.db',
    type: 'string' as const,
    required: false,
  },

  // ログ設定
  LOG_FILE_PATH: {
    default: './logs/komo-manager.log.jsonl',
    type: 'string' as const,
    required: false,
  },
  DISABLE_FILE_LOG: {
    default: 'false',
    type: 'boolean' as const,
    required: false,
  },

  // セキュリティ設定
  ALLOWED_ORIGIN: {
    default: 'http://localhost:3000',
    type: 'string' as const,
    required: false,
  },
  COOKIE_SECRET: {
    default: 'komoriuta-secret-key-change-in-production',
    type: 'string' as const,
    required: true,
  },
} as const;

type ApiEnvConfig = typeof apiEnvConfig;
type ApiEnvKeys = keyof ApiEnvConfig;

/**
 * 型に応じて値を変換
 */
function convertValue<T extends 'string' | 'number' | 'boolean'>(
  value: string,
  type: T,
): T extends 'number' ? number : T extends 'boolean' ? boolean : string {
  if (type === 'number') {
    return Number(value) as never;
  }
  if (type === 'boolean') {
    return (value === 'true') as never;
  }
  return value as never;
}

/**
 * API用の環境変数を取得
 * 型安全な環境変数アクセスを提供
 *
 * @returns 型付きの環境変数オブジェクト
 * @throws 本番環境で必須の環境変数が未設定の場合
 */
export const getEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missingEnv: string[] = [];

  const env = {} as {
    [K in ApiEnvKeys]: ApiEnvConfig[K]['type'] extends 'number'
      ? number
      : ApiEnvConfig[K]['type'] extends 'boolean'
        ? boolean
        : string;
  };

  for (const [key, config] of Object.entries(apiEnvConfig)) {
    const envKey = key as ApiEnvKeys;
    const rawValue = process.env[envKey] || config.default;

    // 本番環境で必須チェック
    if (isProduction && config.required && !rawValue) {
      missingEnv.push(envKey);
    }

    // 型変換して格納
    env[envKey] = convertValue(rawValue, config.type) as never;
  }

  if (missingEnv.length > 0) {
    throw new Error(
      `本番環境で必須の環境変数が未設定です: ${missingEnv.join(', ')}`,
    );
  }

  return env;
};

export type ApiEnv = ReturnType<typeof getEnv>;
