/**
 * AI Controller — SSE 流式端点
 *
 * Step 128: GET /ai/generate (SSE)
 * Step 129: GET /ai/associate (SSE)
 * Step 130: GET /ai/generate-graph (SSE)
 * Step 131: GET /ai/generate-graph-str (非流式)
 * Step 132: SSE close/error 统一处理（pipeStreamToSse / sendSseError）
 */
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AiService } from './ai.service';
import { GenerateQueryDto, AssociateQueryDto, GenerateGraphQueryDto } from './dto';
import { pipeStreamToSse, sendSseError } from './helpers';
import { BizErrorCode } from '../common/exceptions';

@Throttle({ short: { ttl: 1000, limit: 2 }, medium: { ttl: 60000, limit: 30 } })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  getHealth(): { provider: string; circuit: string } {
    return {
      provider: this.aiService.getProviderName(),
      circuit: this.aiService.getCircuitState(),
    };
  }

  /** Step 128: 流式文本生成 */
  @Get('generate')
  async generate(
    @Query() dto: GenerateQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const prompt = dto.direction
        ? `${dto.prompt}\n方向: ${dto.direction}`
        : dto.prompt;
      const stream = await this.aiService.generate({
        prompt,
        canvasId: dto.canvasId,
      });
      pipeStreamToSse(stream, res);
    } catch (err) {
      this.handleSseError(err, res);
    }
  }

  /** Step 129: 流式关联推荐 */
  @Get('associate')
  async associate(
    @Query() dto: AssociateQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // 兼容旧前端: 若只传了 prompt，直接作为文本生成
      if (dto.prompt && !dto.nodeId) {
        const stream = await this.aiService.generate({
          prompt: dto.prompt,
          canvasId: dto.canvasId,
        });
        pipeStreamToSse(stream, res);
        return;
      }
      const stream = await this.aiService.associate({
        nodeId: dto.nodeId ?? '',
        canvasId: dto.canvasId ?? 0,
        context: dto.context ? JSON.parse(dto.context) : undefined,
      });
      pipeStreamToSse(stream, res);
    } catch (err) {
      this.handleSseError(err, res);
    }
  }

  /** Step 130: 流式图谱生成 */
  @Get('generate-graph')
  async generateGraph(
    @Query() dto: GenerateGraphQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const stream = await this.aiService.generateGraph({
        prompt: dto.prompt,
        canvasId: dto.canvasId,
      });
      pipeStreamToSse(stream, res);
    } catch (err) {
      this.handleSseError(err, res);
    }
  }

  /** Step 131: 非流式图谱生成 */
  @Get('generate-graph-str')
  async generateGraphStr(
    @Query() dto: GenerateGraphQueryDto,
  ): Promise<{ result: string }> {
    const result = await this.aiService.generateGraphStr({
      prompt: dto.prompt,
      canvasId: dto.canvasId,
    });
    return { result };
  }

  /** Step 132: SSE 错误统一处理 */
  private handleSseError(err: unknown, res: Response): void {
    const code = (err as any)?.bizCode ?? BizErrorCode.AI_PROVIDER_ERROR;
    const msg = err instanceof Error ? err.message : 'AI 服务异常';
    sendSseError(res, code, msg);
  }
}
