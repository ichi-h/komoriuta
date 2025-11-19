/**
 * フロントエンド環境変数の設定とデフォルト値を定義
 */
const frontendEnvConfig = {
  // API設定
  API_URL: {
    default: 'http://localhost:3001',
    type: 'string' as const,
    required: false,
  },
} as const;

type FrontendEnvConfig = typeof frontendEnvConfig;
type FrontendEnvKeys = keyof FrontendEnvConfig;

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
 * フロントエンド用の環境変数を取得
 * 型安全な環境変数アクセスを提供
 *
 * @returns 型付きの環境変数オブジェクト
 * @throws 必須の環境変数が未設定の場合
 */
export const getEnv = () => {
  const missingEnv: string[] = [];

  const env = {} as {
    [K in FrontendEnvKeys]: FrontendEnvConfig[K]['type'] extends 'number'
      ? number
      : FrontendEnvConfig[K]['type'] extends 'boolean'
        ? boolean
        : string;
  };

  for (const [key, config] of Object.entries(frontendEnvConfig)) {
    const envKey = key as FrontendEnvKeys;
    const rawValue = import.meta.env[envKey] || config.default;

    // 必須チェック（型安全のためasを使用）
    if (config.required && !rawValue) {
      missingEnv.push(envKey);
    }

    // 型変換して格納
    env[envKey] = convertValue(rawValue, config.type) as never;
  }

  if (missingEnv.length > 0) {
    throw new Error(`必須の環境変数が未設定です: ${missingEnv.join(', ')}`);
  }

  return env;
};

export type FrontendEnv = ReturnType<typeof getEnv>;
