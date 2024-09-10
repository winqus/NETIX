import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { NameCategory } from '../interfaces/nameCategory.enum';

export class NameDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  value: string;

  @IsEnum(NameCategory)
  type: NameCategory;

  @IsString()
  @MinLength(0)
  @MaxLength(20)
  language: string;
}
