import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateShareDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['view', 'edit'])
  permission!: string;
}
