/**
 * Step 137: AI 安全 — 注入防护与输出过滤
 *
 * 输入侧：
 * - 过滤 prompt injection 常见模式（角色覆盖、指令注入）
 * - 限制 prompt 长度（DTO 层已限 4000 字符，此处做二次防护）
 *
 * 输出侧：
 * - 过滤可能的敏感信息泄露（API key、内部路径等）
 * - 移除潜在的 HTML/Script 注入内容
 */

/**
 * 已知的 prompt injection 模式
 * 这些模式尝试覆盖系统 prompt 或绕过安全约束
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /\[\s*SYSTEM\s*\]/i,
  /act\s+as\s+(if\s+you|a|an)\s+/i,
  /pretend\s+(to\s+be|you\s+are)\s+/i,
  /jailbreak/i,
  /DAN\s*mode/i,
];

/** prompt 最大长度硬限制 */
const MAX_PROMPT_LENGTH = 4000;

/**
 * 输入净化：检测并清理可能的 prompt injection
 * @returns 净化后的 prompt
 * @throws 如果检测到高风险 injection 模式
 */
export function sanitizePrompt(prompt: string): string {
  // 长度限制
  const trimmed = prompt.slice(0, MAX_PROMPT_LENGTH).trim();

  if (!trimmed) {
    throw new Error('Prompt 不能为空');
  }

  // 检测 injection 模式
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      // 移除匹配的 injection 内容而不是整体拒绝，降低误报
      return trimmed.replace(pattern, '[FILTERED]');
    }
  }

  return trimmed;
}

/**
 * 输出净化：过滤 AI 响应中可能的敏感信息
 */
export function sanitizeOutput(content: string): string {
  let result = content;

  // 过滤可能泄露的 API key（常见格式）
  result = result.replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_KEY]');
  result = result.replace(/Bearer\s+[a-zA-Z0-9._-]{20,}/g, 'Bearer [REDACTED]');

  // 过滤内部文件路径
  result = result.replace(/[A-Z]:\\[^\s"']+/g, '[REDACTED_PATH]');
  result = result.replace(/\/(?:home|root|etc|var|usr)\/[^\s"']+/g, '[REDACTED_PATH]');

  // 过滤 HTML script 标签（防止 XSS）
  result = result.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '[FILTERED_SCRIPT]');
  result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '[FILTERED_EVENT]');

  return result;
}
