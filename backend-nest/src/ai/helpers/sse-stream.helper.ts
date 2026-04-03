/**
 * Step 128-132: SSE 流式响应辅助
 *
 * 将 AI Provider 返回的原始 Readable（OpenAI streaming response）
 * 转换为标准 SSE 格式（event: push/close/error）。
 *
 * 兼容红线 RL-06：事件语义保持 push/close/error 可识别。
 */
import { Response } from 'express';
import { Readable } from 'stream';
import { BizErrorCode } from '../../common/exceptions';

/**
 * 将 AI Provider 的流式 Readable 通过 SSE 推送到客户端。
 *
 * 协议：
 * - event: push  data: <chunk>       → 流式数据推送
 * - event: close data: [DONE]        → 流完成
 * - event: error data: {code, msg}   → 异常中断
 */
export function pipeStreamToSse(stream: Readable, res: Response): void {
  // SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let buffer = '';
  let closed = false;

  const closeOnce = () => {
    if (closed) return;
    closed = true;
    writeSseEvent(res, 'close', '[DONE]');
    res.end();
  };

  stream.on('data', (chunk: Buffer | string) => {
    const text = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
    buffer += text;

    // 按行解析 SSE 数据块（OpenAI 流格式: data: {...}\n\n）
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // 保留不完整行

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // OpenAI 流结束标记
      if (trimmed === 'data: [DONE]') {
        closeOnce();
        return;
      }

      // OpenAI 数据行
      if (trimmed.startsWith('data: ')) {
        const payload = trimmed.slice(6);
        const content = extractContent(payload);
        if (content) {
          writeSseEvent(res, 'push', content);
        }
      }
    }
  });

  stream.on('end', () => {
    // 处理 buffer 中剩余数据
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
        const content = extractContent(trimmed.slice(6));
        if (content) {
          writeSseEvent(res, 'push', content);
        }
      }
    }
    closeOnce();
  });

  stream.on('error', (err: Error) => {
    const errorPayload = JSON.stringify({
      code: BizErrorCode.AI_PROVIDER_ERROR,
      msg: err.message || 'AI 流式响应异常',
    });
    writeSseEvent(res, 'error', errorPayload);
    res.end();
  });

  // 客户端断开时清理
  res.on('close', () => {
    stream.destroy();
  });
}

/**
 * 发送 SSE 错误事件并结束响应（用于 stream 获取前的同步错误）
 */
export function sendSseError(res: Response, code: number, msg: string): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  writeSseEvent(res, 'error', JSON.stringify({ code, msg }));
  res.end();
}

// ────────────────────── 内部工具 ──────────────────────

function writeSseEvent(res: Response, event: string, data: string): void {
  if (res.writableEnded) return;
  res.write(`event: ${event}\ndata: ${data}\n\n`);
}

/**
 * 从 OpenAI streaming JSON 中提取 delta.content
 */
function extractContent(jsonStr: string): string | null {
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    // 非 JSON 数据直接作为 content 推送
    return jsonStr;
  }
}
