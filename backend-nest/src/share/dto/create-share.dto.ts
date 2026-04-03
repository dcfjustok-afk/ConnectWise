import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateShareDto {
  @IsInt()
  @Min(1)
  canvasId!: number;

  /** 兼容旧前端字段名 userName */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  userName?: string;

  /** 新字段名 */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  toUsername?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['view', 'edit'])
  permission!: string;
}
