import staticPlugin from '@elysiajs/static';
import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/api/get', () => 'Hello, Elysia!')
  .use(
    staticPlugin({
      prefix: '/',
    }),
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
