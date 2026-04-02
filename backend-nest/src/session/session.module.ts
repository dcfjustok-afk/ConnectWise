/**
 * Session 中间件共享 Provider
 *
 * 导出 SESSION_MIDDLEWARE token，供 main.ts（app.use）和 RealtimeModule（WS upgrade）
 * 共享同一个 express-session 中间件实例。
 *
 * 生产环境自动接入 Redis Store；无 Redis 配置时回退 MemoryStore（适合测试与开发）。
 */
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as expressSession from 'express-session';
import { RequestHandler } from 'express';

export const SESSION_MIDDLEWARE = Symbol('SESSION_MIDDLEWARE');

function createSessionMiddleware(configService: ConfigService): RequestHandler {
  const sessionName = configService.get<string>('session.name', 'connectwise.sid');
  const sessionSecret = configService.get<string>('session.secret', 'dev-secret');
  const sessionTtl = configService.get<number>('session.ttlSeconds', 604800);
  const cookieSecure = configService.get<boolean>('session.cookie.secure', false);
  const cookieHttpOnly = configService.get<boolean>('session.cookie.httpOnly', true);
  const cookieSameSite = configService.get<string>('session.cookie.sameSite', 'lax') as
    | 'strict'
    | 'lax'
    | 'none';

  // 尝试使用 Redis Store（main.ts 会通过 replaceSessionStore 覆盖）
  const opts: expressSession.SessionOptions = {
    name: sessionName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: cookieSecure,
      httpOnly: cookieHttpOnly,
      sameSite: cookieSameSite,
      maxAge: sessionTtl * 1000,
    },
  };

  return expressSession(opts);
}

@Global()
@Module({
  providers: [
    {
      provide: SESSION_MIDDLEWARE,
      useFactory: (configService: ConfigService) => createSessionMiddleware(configService),
      inject: [ConfigService],
    },
  ],
  exports: [SESSION_MIDDLEWARE],
})
export class SessionModule {}
