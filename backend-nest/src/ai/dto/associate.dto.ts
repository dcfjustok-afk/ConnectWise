import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AssociateQueryDto {
  /** 兼容旧前端：直接传 prompt 文本 */
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  prompt?: string;

  /** 新接口：节点 ID */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nodeId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  canvasId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  context?: string;
}
