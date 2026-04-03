/**
 * 日志脱敏工具
 *
 * 用于在记录日志前清除或掩码敏感字段：
 * - 密码、token、secret、apiKey
 * - 会话 ID
 * - 邮箱（部分掩码）
 */

const SENSITIVE_KEYS = /password|passwd|secret|token|apikey|api_key|authorization|cookie|session/i;

/** 掩码字符串：保留首尾各 2 字符，中间用 *** 替代 */
function mask(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '***' + value.slice(-2);
}

/** 掩码邮箱：user***@domain */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return mask(email);
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return (local.length <= 2 ? local : local.slice(0, 2) + '***') + domain;
}

/**
 * 递归脱敏对象（返回新对象，不修改原始值）
 */
export function sanitizeForLog(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLog(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.test(key)) {
        result[key] = typeof value === 'string' ? mask(value) : '****';
      } else if (key === 'email' && typeof value === 'string') {
        result[key] = maskEmail(value);
      } else {
        result[key] = sanitizeForLog(value);
      }
    }
    return result;
  }

  return obj;
}
