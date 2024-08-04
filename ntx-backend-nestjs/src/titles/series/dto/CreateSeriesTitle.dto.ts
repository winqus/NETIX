import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { NameDTO } from '@ntx/titles/dto/Name.dto';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, ValidateNested } from 'class-validator';

export class CreateSeriesTitleDTO {
  @IsEnum(TitleType)
  type: TitleType;

  @ValidateNested({ each: true })
  @Type(() => NameDTO)
  names: NameDTO[];

  @IsDate()
  releaseDate: Date;
}
