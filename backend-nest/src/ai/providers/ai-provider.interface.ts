/**
 * Step 126: AI Provider 抽象接口
 *
 * 定义统一的 AI Provider 接口，隔离厂商 SDK 差异。
 * 业务层仅依赖此接口，不直接依赖 OpenAI/Anthropic 等具体实现。
 */
import { Readable } from 'stream';

/**
 * AI 生成请求参数
 */
export interface AiGenerateParams {
  prompt: string;
  canvasId?: number;
  /** 可选的上下文或节点数据 */
  context?: unknown;
}

/**
 * AI 关联推荐请求参数
 */
export interface AiAssociateParams {
  nodeId: string;
  canvasId: number;
  context?: unknown;
}

/**
 * AI 生成图谱请求参数
 */
export interface AiGenerateGraphParams {
  prompt: string;
  canvasId?: number;
  context?: unknown;
}

/**
 * AI Provider 统一接口
 *
 * 所有方法的流式返回使用 Node.js Readable（text/event-stream 兼容）。
 * 非流式方法直接返回字符串。
 */
export interface IAiProvider {
  /** 提供者名称标识（如 'openai', 'ollama'） */
  readonly name: string;

  /** 流式文本生成 */
  generate(params: AiGenerateParams): Promise<Readable>;

  /** 流式关联推荐 */
  associate(params: AiAssociateParams): Promise<Readable>;

  /** 流式图谱生成 */
  generateGraph(params: AiGenerateGraphParams): Promise<Readable>;

  /** 非流式图谱生成（返回完整 JSON 字符串） */
  generateGraphStr(params: AiGenerateGraphParams): Promise<string>;
}

/**
 * DI Token — 供 NestJS 注入使用
 */
export const AI_PROVIDER = Symbol('AI_PROVIDER');
