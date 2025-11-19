/**
 * Web（フロントエンド+プロキシ）環境変数の設定とデフォルト値を定義
 */
const webEnvConfig = {
  // プロキシ設定
  WEB_PORT: { default: '3000', type: 'number' as const, required: false },
  WEB_HOST: { default: '0.0.0.0', type: 'string' as const, required: false },

  // フロントエンド設定
  FRONTEND_DEV_MODE: {
    default: 'false',
    type: 'boolean' as const,
    required: false,
  },

  // API設定
  API_URL: {
    default: 'http://127.0.0.1:3001',
    type: 'string' as const,
    required: false,
  },

  // ログ設定
  LOG_FILE_PATH: {
    default: './logs/komo-web.log.jsonl',
    type: 'string' as const,
    required: false,
  },
  DISABLE_FILE_LOG: {
    default: 'false',
    type: 'boolean' as const,
    required: false,
  },
} as const;

type WebEnvConfig = typeof webEnvConfig;
type WebEnvKeys = keyof WebEnvConfig;

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
 * Web用の環境変数を取得
 * 型安全な環境変数アクセスを提供
 */
export const getEnv = () => {
  const env = {} as {
    [K in WebEnvKeys]: WebEnvConfig[K]['type'] extends 'number'
      ? number
      : WebEnvConfig[K]['type'] extends 'boolean'
        ? boolean
        : string;
  };

  for (const [key, config] of Object.entries(webEnvConfig)) {
    const envKey = key as WebEnvKeys;
    const rawValue = process.env[envKey] || config.default;

    // 型変換して格納
    env[envKey] = convertValue(rawValue, config.type) as never;
  }

  return env;
};

export type WebEnv = ReturnType<typeof getEnv>;
