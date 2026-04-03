/**
 * AI Service — 业务编排层
 *
 * 集成：
 * - Step 125: IAiProvider 调用封装
 * - Step 134: 超时与重试策略（withRetry）
 * - Step 135: 熔断与降级兜底（CircuitBreaker）
 * - Step 136: 配额策略（内存滑动窗口计数）
 * - Step 137: 输入净化（sanitizePrompt）+ 输出过滤（sanitizeOutput，流场景在 SSE helper 处理）
 */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { BizErrorCode, BusinessException } from '../common/exceptions';
import {
  AI_PROVIDER,
  IAiProvider,
  AiGenerateParams,
  AiAssociateParams,
  AiGenerateGraphParams,
} from './providers';
import { withRetry, CircuitBreaker, sanitizePrompt, sanitizeOutput } from './helpers';

@Injectable()
export class AiService {
  private readonly circuitBreaker: CircuitBreaker;
  private readonly maxRetries: number;

  /** Step 136: 简易滑动窗口配额（每分钟请求数） */
  private readonly quotaWindowMs = 60_000;
  private readonly maxRequestsPerMinute: number;
  private readonly requestTimestamps: number[] = [];

  constructor(
    @Inject(AI_PROVIDER) private readonly provider: IAiProvider,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('ai.maxRetries', 2);
    this.maxRequestsPerMinute = this.configService.get<number>('ai.maxRequestsPerMinute', 60);
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      cooldownMs: 30_000,
    });
  }

  async generate(params: AiGenerateParams): Promise<Readable> {
    this.checkQuota();
    const sanitized = { ...params, prompt: sanitizePrompt(params.prompt) };
    return this.execWithResilience(() => this.provider.generate(sanitized));
  }

  async associate(params: AiAssociateParams): Promise<Readable> {
    this.checkQuota();
    return this.execWithResilience(() => this.provider.associate(params));
  }

  async generateGraph(params: AiGenerateGraphParams): Promise<Readable> {
    this.checkQuota();
    const sanitized = { ...params, prompt: sanitizePrompt(params.prompt) };
    return this.execWithResilience(() => this.provider.generateGraph(sanitized));
  }

  async generateGraphStr(params: AiGenerateGraphParams): Promise<string> {
    this.checkQuota();
    const sanitized = { ...params, prompt: sanitizePrompt(params.prompt) };
    const raw = await this.execWithResilience(() =>
      this.provider.generateGraphStr(sanitized),
    );
    return sanitizeOutput(raw);
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getCircuitState(): string {
    return this.circuitBreaker.getState();
  }

  // ────────────────────── 内部方法 ──────────────────────

  /** Step 134 + 135: 重试 + 熔断组合 */
  private async execWithResilience<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await this.circuitBreaker.exec(() =>
        withRetry(fn, { maxRetries: this.maxRetries }),
      );
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /** Step 136: 滑动窗口配额检查 */
  private checkQuota(): void {
    const now = Date.now();
    // 清理过期时间戳
    while (this.requestTimestamps.length > 0 && this.requestTimestamps[0] < now - this.quotaWindowMs) {
      this.requestTimestamps.shift();
    }
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      throw new BusinessException(BizErrorCode.AI_QUOTA_EXCEEDED, 'AI 请求频率超限，请稍后重试');
    }
    this.requestTimestamps.push(now);
  }

  private wrapError(err: unknown): BusinessException {
    if (err instanceof BusinessException) return err;

    const message = err instanceof Error ? err.message : 'AI 服务异常';

    if (message.includes('abort') || message.includes('timeout')) {
      return new BusinessException(BizErrorCode.AI_TIMEOUT, `AI 请求超时: ${message}`);
    }

    return new BusinessException(BizErrorCode.AI_PROVIDER_ERROR, `AI 服务错误: ${message}`);
  }
}
