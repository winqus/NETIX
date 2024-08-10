import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateTitleFromExternalSourceDTO {
  @IsString()
  @MinLength(1)
  externalTitleID: string;

  @IsEnum(TitleType)
  type: TitleType;

  @IsString()
  @MinLength(1)
  externalSourceUUID: string;
}
