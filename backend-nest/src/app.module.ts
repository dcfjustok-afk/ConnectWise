import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CanvasModule } from './canvas/canvas.module';
import { ShareModule } from './share/share.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AiModule } from './ai/ai.module';
import { SessionModule } from './session/session.module';
import { AuthGuard } from './auth/guards/auth.guard';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import redisConfig from './config/redis.config';
import sessionConfig from './config/session.config';
import minioConfig from './config/minio.config';
import aiConfig from './config/ai.config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, dbConfig, redisConfig, sessionConfig, minioConfig, aiConfig],
      validationSchema: envValidationSchema,
      expandVariables: true,
    }),
    PrismaModule,
    SessionModule,
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
  ],
})
export class AppModule {}
