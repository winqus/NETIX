import { IsString, MinLength } from 'class-validator';

export class CreateSeriesFromExternalSourceDTO {
  @IsString()
  @MinLength(1)
  externalTitleID: string;

  @IsString()
  @MinLength(1)
  externalSourceUUID: string;
}
