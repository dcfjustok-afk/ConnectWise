/**
 * Step 125 + 127: AI Module
 *
 * 注册 AI Provider 工厂（通过 ConfigService 读取 ai.provider 配置动态创建），
 * 提供 AiService 与 AiController。
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_PROVIDER, createAiProvider } from './providers';

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: AI_PROVIDER,
      useFactory: (configService: ConfigService) => createAiProvider(configService),
      inject: [ConfigService],
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
