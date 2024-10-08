import { IsString, Length } from 'class-validator';

export class ImportMovieDTO {
  @IsString()
  @Length(1, 1000)
  externalProviderID: string;

  @IsString()
  @Length(1, 1000)
  externalID: string;
}
