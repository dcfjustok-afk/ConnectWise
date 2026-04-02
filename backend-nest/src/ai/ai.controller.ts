/**
 * Step 125: AI Controller — 路由骨架
 *
 * SSE 端点实现将在 Step 128-131 完成。
 * 当前仅定义路由骨架与 DTO 占位。
 */
import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * GET /ai/generate — SSE 流式生成（Step 128 实现）
   * GET /ai/associate — SSE 流式关联（Step 129 实现）
   * GET /ai/generate-graph — SSE 流式图谱生成（Step 130 实现）
   * GET /ai/generate-graph-str — 非流式图谱生成（Step 131 实现）
   */

  @Get('health')
  getHealth(): { provider: string } {
    return { provider: this.aiService.getProviderName() };
  }
}
