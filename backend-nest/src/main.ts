import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import Redis from 'ioredis';
import { AppModule } from './app.module';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const port = configService.get<number>('app.port', 3000);

  // Redis 客户端
  const redisClient = new Redis({
    host: configService.get<string>('redis.host', '127.0.0.1'),
    port: configService.get<number>('redis.port', 6379),
    db: configService.get<number>('redis.db', 0),
    password: configService.get<string>('redis.password') || undefined,
    lazyConnect: true,
  });

  // 生产环境使用 Redis Store 的 session 中间件
  // 注意：这是 HTTP 层的 session 中间件（通过 app.use 注册）
  // WS 层的 session 中间件由 SessionModule 提供（DI 注入给 RealtimeModule）
  // 两者共用同一份配置参数，但生产环境 HTTP 使用 Redis Store
  const sessionName = configService.get<string>('session.name', 'connectwise.sid');
  const sessionSecret = configService.get<string>('session.secret', '');
  const sessionTtl = configService.get<number>('session.ttlSeconds', 604800);
  const cookieSecure = configService.get<boolean>('session.cookie.secure', false);
  const cookieHttpOnly = configService.get<boolean>('session.cookie.httpOnly', true);
  const cookieSameSite = configService.get<string>('session.cookie.sameSite', 'lax') as
    | 'strict'
    | 'lax'
    | 'none';

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: 'sess:',
        ttl: sessionTtl,
      }),
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
    }),
  );

  // CORS — 允许前端 withCredentials
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin', 'http://localhost:5173'),
    credentials: true,
    maxAge: 86400,
  });

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
}

void bootstrap();
