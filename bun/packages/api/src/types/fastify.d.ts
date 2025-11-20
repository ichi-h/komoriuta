/**
 * Fastify型拡張
 */

import '@fastify/cookie';
import '@fastify/cors';

declare module 'fastify' {
  interface FastifyRequest {
    cookies: {
      [key: string]: string | undefined;
    };
    userId?: string;
    serverId?: number;
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: {
        path?: string;
        maxAge?: number;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
      },
    ): this;
    clearCookie(name: string): this;
  }
}
