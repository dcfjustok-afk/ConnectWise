import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateShareDto {
  /** share 记录主键 ID */
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  /** 兼容旧前端：用 userId + canvasId 定位 */
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  canvasId?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['view', 'edit'])
  permission!: string;
}
