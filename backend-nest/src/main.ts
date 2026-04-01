import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { getSessionConfig } from './config/session.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sessionConfig = getSessionConfig();

  const redisClient = createClient({
    url: sessionConfig.redisUrl,
  });
  await redisClient.connect();

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: sessionConfig.redisPrefix,
      }),
      name: sessionConfig.cookieName,
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: sessionConfig.cookie,
    }),
  );

  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
