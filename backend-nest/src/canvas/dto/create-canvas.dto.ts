import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCanvasDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsArray()
  @IsOptional()
  nodes?: unknown[];

  @IsArray()
  @IsOptional()
  edges?: unknown[];
}
