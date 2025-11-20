/**
 * 開発・テスト用の初期データ投入スクリプト
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { getEnv } from 'src/utils/env';
import { runMigrations } from '../../db/migrations';
import { AccessTokensRepository } from '../../db/repositories/access-tokens';
import { ServersRepository } from '../../db/repositories/servers';
import { hashPassword } from '../../utils/crypto';

const { DB_PATH } = getEnv();

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // データベース接続
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
    }

    const db = new Database(DB_PATH);

    // マイグレーションを実行
    console.log('🔄 Running migrations...');
    await runMigrations(db);

    const serversRepo = new ServersRepository(db);
    const tokensRepo = new AccessTokensRepository(db);

    // 既存データをチェック
    const existingServers = serversRepo.findAll();
    if (existingServers.length > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log(`   Found ${existingServers.length} existing server(s).`);
      db.close();
      return;
    }

    console.log('📝 Creating sample servers...');

    // サンプルサーバー1
    const server1Uuid = crypto.randomUUID();
    const server1Id = serversRepo.create({
      uuid: server1Uuid,
      name: 'Development Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    const token1 = 'dev-token-12345678901234567890123456789012';
    tokensRepo.create({
      serverId: server1Id,
      tokenHash: hashPassword(token1),
      expiresAt: null, // 無期限
    });

    console.log(`✅ Server 1: ${server1Uuid}`);
    console.log(`   Name: Development Server`);
    console.log(`   Token: ${token1}`);
    console.log('');

    // サンプルサーバー2
    const server2Uuid = crypto.randomUUID();
    const server2Id = serversRepo.create({
      uuid: server2Uuid,
      name: 'Test Server',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      heartbeatInterval: 30,
    });

    const token2 = 'test-token-98765432109876543210987654321098';
    tokensRepo.create({
      serverId: server2Id,
      tokenHash: hashPassword(token2),
      expiresAt: null, // 無期限
    });

    console.log(`✅ Server 2: ${server2Uuid}`);
    console.log(`   Name: Test Server`);
    console.log(`   Token: ${token2}`);
    console.log('');

    // サンプルサーバー3（期限付きトークン）
    const server3Uuid = crypto.randomUUID();
    const server3Id = serversRepo.create({
      uuid: server3Uuid,
      name: 'Staging Server',
      macAddress: '11:22:33:44:55:66',
      heartbeatInterval: 60,
    });

    const token3 = 'staging-token-11111111111111111111111111111111';
    const expiresAt = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString(); // 90日後
    tokensRepo.create({
      serverId: server3Id,
      tokenHash: hashPassword(token3),
      expiresAt,
    });

    console.log(`✅ Server 3: ${server3Uuid}`);
    console.log(`   Name: Staging Server`);
    console.log(`   Token: ${token3}`);
    console.log(`   Expires: ${expiresAt}`);
    console.log('');

    db.close();

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - 3 servers created');
    console.log('   - 3 access tokens created');
    console.log('   - Database path:', DB_PATH);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

// スクリプト実行
seed();
