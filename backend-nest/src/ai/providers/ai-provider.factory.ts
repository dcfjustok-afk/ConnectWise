/**
 * Step 127: AI Provider 工厂
 *
 * 根据 ai.provider 配置值创建对应的 IAiProvider 实例。
 * 当前支持：openai（兼容 OpenAI API 的服务均可走此通道）。
 * 扩展时仅需添加 case 分支 + 新 Provider 类。
 */
import { ConfigService } from '@nestjs/config';
import { IAiProvider } from './ai-provider.interface';
import { OpenAiProvider } from './openai.provider';

const SUPPORTED_PROVIDERS = ['openai'] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export function createAiProvider(configService: ConfigService): IAiProvider {
  const providerName = configService.get<string>('ai.provider', 'openai') as SupportedProvider;

  switch (providerName) {
    case 'openai':
      return new OpenAiProvider({
        baseUrl: configService.getOrThrow<string>('ai.baseUrl'),
        apiKey: configService.get<string>('ai.apiKey'),
        model: configService.getOrThrow<string>('ai.model'),
        timeoutMs: configService.get<number>('ai.timeoutMs', 30000),
      });

    default: {
      const _exhaustive: never = providerName;
      throw new Error(`不支持的 AI Provider: ${_exhaustive}`);
    }
  }
}
