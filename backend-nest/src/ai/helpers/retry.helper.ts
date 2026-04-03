/**
 * Step 134: AI 超时与重试策略
 *
 * 可重试包装器：对 AI Provider 调用进行指数退退重试。
 * 仅对可重试错误（超时、5xx、网络）进行重试，业务错误直接抛出。
 */

export interface RetryOptions {
  /** 最大重试次数（不含首次调用） */
  maxRetries: number;
  /** 首次重试等待时间（ms） */
  baseDelayMs?: number;
}

const DEFAULT_BASE_DELAY = 1000;

/**
 * 带指数退避的重试包装
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions,
): Promise<T> {
  const { maxRetries, baseDelayMs = DEFAULT_BASE_DELAY } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // 最后一次尝试不再重试
      if (attempt >= maxRetries) break;

      // 仅对可重试错误重试
      if (!isRetryable(err)) break;

      // 指数退避 + 抖动
      const delay = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
      await sleep(delay);
    }
  }

  throw lastError;
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const msg = err.message.toLowerCase();

  // 超时 / 中断
  if (msg.includes('abort') || msg.includes('timeout') || msg.includes('etimedout')) {
    return true;
  }

  // 网络错误
  if (msg.includes('econnreset') || msg.includes('econnrefused') || msg.includes('fetch failed')) {
    return true;
  }

  // 5xx 服务端错误
  if (/\b5\d{2}\b/.test(msg)) {
    return true;
  }

  // 429 Too Many Requests（速率限制）
  if (msg.includes('429') || msg.includes('rate limit')) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
