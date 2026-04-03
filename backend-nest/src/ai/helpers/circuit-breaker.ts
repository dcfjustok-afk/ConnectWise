/**
 * Step 135: AI 熔断与降级兜底
 *
 * 轻量级内存熔断器：连续失败 N 次后打开熔断，等待冷却后半开尝试。
 * 状态机：CLOSED → OPEN → HALF_OPEN → CLOSED / OPEN
 */
import { BizErrorCode, BusinessException } from '../../common/exceptions';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** 连续失败多少次触发熔断 */
  failureThreshold: number;
  /** 熔断冷却时间（ms） */
  cooldownMs: number;
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(private readonly opts: CircuitBreakerOptions) {}

  /**
   * 通过熔断器执行操作
   */
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.opts.cooldownMs) {
        // 冷却结束，尝试半开
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new BusinessException(
          BizErrorCode.AI_PROVIDER_ERROR,
          'AI 服务暂时不可用（熔断中），请稍后重试',
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  /** 手动复位（测试用） */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // 半开状态下失败 → 重新回到 OPEN
      this.state = CircuitState.OPEN;
    } else if (this.failureCount >= this.opts.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
