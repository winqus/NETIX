import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { NameDTO } from '@ntx/titles-legacy/dto/Name.dto';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, ValidateNested } from 'class-validator';

export class CreateSeriesTitleDTO {
  @ValidateNested({ each: true })
  @Type(() => NameDTO)
  names: NameDTO[];

  @IsDate()
  releaseDate: Date;
}
