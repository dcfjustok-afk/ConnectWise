/**
 * Step 125: AI Service — 业务编排层
 *
 * 封装 IAiProvider 调用，处理参数校验与异常转换。
 * SSE 端点的流式响应将在 Step 128-131 中实现。
 */
import { Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { BizErrorCode, BusinessException } from '../common/exceptions';
import {
  AI_PROVIDER,
  IAiProvider,
  AiGenerateParams,
  AiAssociateParams,
  AiGenerateGraphParams,
} from './providers';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: IAiProvider,
  ) {}

  async generate(params: AiGenerateParams): Promise<Readable> {
    try {
      return await this.provider.generate(params);
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  async associate(params: AiAssociateParams): Promise<Readable> {
    try {
      return await this.provider.associate(params);
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  async generateGraph(params: AiGenerateGraphParams): Promise<Readable> {
    try {
      return await this.provider.generateGraph(params);
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  async generateGraphStr(params: AiGenerateGraphParams): Promise<string> {
    try {
      return await this.provider.generateGraphStr(params);
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** 当前 Provider 名称 */
  getProviderName(): string {
    return this.provider.name;
  }

  private wrapError(err: unknown): BusinessException {
    if (err instanceof BusinessException) return err;

    const message = err instanceof Error ? err.message : 'AI 服务异常';

    // 超时检测
    if (message.includes('abort') || message.includes('timeout')) {
      return new BusinessException(BizErrorCode.AI_TIMEOUT, `AI 请求超时: ${message}`);
    }

    return new BusinessException(BizErrorCode.AI_PROVIDER_ERROR, `AI 服务错误: ${message}`);
  }
}
