/**
 * komo-manager エントリーポイント
 * Proxyサーバーを起動し、BackendとFrontendへルーティングを行う
 */

import { startProxy } from './proxy';

async function main() {
  try {
    await startProxy();
  } catch (error) {
    console.error('Failed to start komo-manager:', error);
    process.exit(1);
  }
}

main();
