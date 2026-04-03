import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateGraphQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  prompt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  canvasId?: number;
}
