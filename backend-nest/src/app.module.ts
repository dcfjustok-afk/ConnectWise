import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CanvasModule } from './canvas/canvas.module';
import { ShareModule } from './share/share.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AiModule } from './ai/ai.module';
import { MinioModule } from './minio/minio.module';
import { SessionModule } from './session/session.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { AppThrottlerGuard } from './common/guards/throttler.guard';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import redisConfig from './config/redis.config';
import sessionConfig from './config/session.config';
import minioConfig from './config/minio.config';
import aiConfig from './config/ai.config';
import { envValidationSchema } from './config/env.validation';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, dbConfig, redisConfig, sessionConfig, minioConfig, aiConfig],
      validationSchema: envValidationSchema,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 5 },    // 1 秒 5 次（防暴力）
        { name: 'medium', ttl: 60000, limit: 60 },  // 1 分钟 60 次（常规）
      ],
    }),
    PrismaModule,
    SessionModule,
    MinioModule,
    AuthModule,
    UserModule,
    CanvasModule,
    ShareModule,
    RealtimeModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
