import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Title } from '@ntx/common/interfaces/title.interface';
import { IsDate, IsInt, IsOptional, IsPositive, IsString, Length, Matches, Max, Min } from 'class-validator';

export class Movie implements Title {
  @IsString()
  uuid: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  posterID: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @Matches(TitleType.MOVIE)
  type: TitleType;

  @IsString()
  hash: string;

  @IsDate()
  originallyReleasedAt: Date;

  @IsString()
  @Length(1, 1000)
  summary: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(12_000)
  runtimeMinutes: number;

  @IsString()
  @IsOptional()
  videoID?: string;
}
