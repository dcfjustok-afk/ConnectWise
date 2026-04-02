import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCanvasDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsArray()
  @IsOptional()
  nodes?: unknown[];

  @IsArray()
  @IsOptional()
  edges?: unknown[];
}
