import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateShareDto {
  @IsInt()
  @Min(1)
  canvasId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  toUsername!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['view', 'edit'])
  permission!: string;
}
