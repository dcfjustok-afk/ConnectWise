/**
 * OpenAI 兼容 Provider 实现
 *
 * 支持所有 OpenAI API 兼容服务（OpenAI、Azure OpenAI、Ollama、vLLM 等）。
 * 通过 ai.baseUrl + ai.apiKey + ai.model 配置切换。
 */
import { Readable } from 'stream';
import {
  IAiProvider,
  AiGenerateParams,
  AiAssociateParams,
  AiGenerateGraphParams,
} from './ai-provider.interface';

export interface OpenAiProviderConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export class OpenAiProvider implements IAiProvider {
  readonly name = 'openai';

  constructor(private readonly config: OpenAiProviderConfig) {}

  async generate(params: AiGenerateParams): Promise<Readable> {
    return this.streamChat(this.buildMessages('generate', params.prompt, params.context));
  }

  async associate(params: AiAssociateParams): Promise<Readable> {
    const prompt = `为节点 ${params.nodeId} 推荐关联内容`;
    return this.streamChat(this.buildMessages('associate', prompt, params.context));
  }

  async generateGraph(params: AiGenerateGraphParams): Promise<Readable> {
    return this.streamChat(this.buildMessages('generateGraph', params.prompt, params.context));
  }

  async generateGraphStr(params: AiGenerateGraphParams): Promise<string> {
    const messages = this.buildMessages('generateGraph', params.prompt, params.context);
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      stream: false,
    });

    const res = await this.fetchWithTimeout(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body,
    });

    if (!res.ok) {
      throw new Error(`AI provider error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? '';
  }

  // ────────────────────── 内部方法 ──────────────────────

  private buildMessages(
    role: string,
    prompt: string,
    context?: unknown,
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: `你是一个知识图谱助手，当前任务: ${role}` },
      { role: 'user', content: prompt },
    ];
    if (context) {
      messages.splice(1, 0, {
        role: 'user',
        content: `上下文: ${JSON.stringify(context)}`,
      });
    }
    return messages;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }

  private async streamChat(
    messages: Array<{ role: string; content: string }>,
  ): Promise<Readable> {
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      stream: true,
    });

    const res = await this.fetchWithTimeout(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body,
    });

    if (!res.ok) {
      throw new Error(`AI provider error: ${res.status} ${res.statusText}`);
    }

    // 将 Web ReadableStream 转为 Node.js Readable
    if (!res.body) {
      throw new Error('AI provider returned empty body');
    }
    return Readable.fromWeb(res.body as any);
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}
