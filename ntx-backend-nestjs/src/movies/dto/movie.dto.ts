import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import {
  MOVIES_NAME_LENGTH_MAX,
  MOVIES_NAME_LENGTH_MIN,
  MOVIES_RUNTIME_MINS_MAX,
  MOVIES_RUNTIME_MINS_MIN,
  MOVIES_SUMMARY_LENGTH_MAX,
  MOVIES_SUMMARY_LENGTH_MIN,
} from '../movies.constants';

export class MovieDTO {
  @IsString()
  id: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  @Length(MOVIES_NAME_LENGTH_MIN, MOVIES_NAME_LENGTH_MAX)
  name: string;

  @IsString()
  @Length(MOVIES_SUMMARY_LENGTH_MIN, MOVIES_SUMMARY_LENGTH_MAX)
  summary: string;

  @IsDate()
  originallyReleasedAt: Date;

  @IsBoolean()
  isPublished: boolean;

  @IsInt()
  @Min(MOVIES_RUNTIME_MINS_MIN)
  @Max(MOVIES_RUNTIME_MINS_MAX)
  runtimeMinutes: number;

  @IsString()
  posterID: string;

  @IsString()
  @IsOptional()
  backdropID?: string;

  @IsString()
  @IsOptional()
  videoID?: string;
}
