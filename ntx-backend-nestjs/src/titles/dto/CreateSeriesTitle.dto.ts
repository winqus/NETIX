import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, ValidateNested } from 'class-validator';
import { NameDTO } from './Name.dto';

export class CreateSeriesTitleDTO {
  @IsEnum(TitleType)
  type: TitleType;

  @ValidateNested({ each: true })
  @Type(() => NameDTO)
  names: NameDTO[];

  @IsDate()
  releaseDate: Date;
}
