import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  prompt!: string;

  /** 兼容旧前端：可选的生成方向 */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direction?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  canvasId?: number;
}
