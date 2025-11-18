import { create } from '@bufbuild/protobuf';
import type { ConnectRouter } from '@connectrpc/connect';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import {
  AuthService,
  type LoginRequest,
  LoginResponseSchema,
  LogoutResponseSchema,
  VerifyResponseSchema,
} from '@komo-manager/connect/komoriuta/v1/auth_pb';
import { fastify } from 'fastify';

// ConnectRPCルーターの作成
const routes = (router: ConnectRouter) => {
  router.service(AuthService, {
    async login(req: LoginRequest) {
      console.log('Login request received:', {
        userId: req.userId,
        password: '***',
      });

      // 仮実装: とりあえずリクエストを受け取って成功レスポンスを返す
      return create(LoginResponseSchema, {
        success: true,
        failedAttempts: 0,
      });
    },

    async logout() {
      console.log('Logout request received');
      return create(LogoutResponseSchema, {
        success: true,
      });
    },

    async verify() {
      console.log('Verify request received');
      return create(VerifyResponseSchema, {
        authenticated: true,
      });
    },
  });
};

// Fastifyサーバーを作成
const server = fastify();

// ConnectRPCプラグインを登録
await server.register(fastifyConnectPlugin, {
  routes,
});

// 通常のエンドポイント
server.get('/api/get', (_, reply) => {
  reply.type('text/plain').send('Hello, Bun with Fastify and ConnectRPC!');
});

// サーバー起動
const PORT = 3000;
await server.listen({ host: 'localhost', port: PORT });

console.log(`🦊 Fastify server is running at http://localhost:${PORT}`);
console.log(`📡 ConnectRPC endpoint: http://localhost:${PORT}`);
console.log(`   Available services: komoriuta.v1.AuthService`);
