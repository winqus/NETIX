import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsPositive, Min, ValidateNested } from 'class-validator';
import { NameDTO } from './Name.dto';

export class CreateMovieTitleDTO {
  @IsEnum(TitleType)
  type: TitleType;

  @ValidateNested({ each: true })
  @Type(() => NameDTO)
  names: NameDTO[];

  @IsDate()
  releaseDate: Date;

  @IsPositive()
  @Min(1)
  runtimeMinutes: number;
}
