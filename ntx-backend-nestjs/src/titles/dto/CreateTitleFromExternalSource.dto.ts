import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateTitleFromExternalSourceDTO {
  @IsString()
  @MinLength(1)
  readonly externalTitleID: string;

  @IsEnum(TitleType)
  @IsEnum(TitleType)
  readonly type: TitleType;

  @IsString()
  @MinLength(1)
  readonly externalSourceUUID: string;
}
