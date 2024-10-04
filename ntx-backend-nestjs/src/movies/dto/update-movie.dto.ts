import { IsDate, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import {
  MOVIES_NAME_LENGTH_MAX,
  MOVIES_NAME_LENGTH_MIN,
  MOVIES_RUNTIME_MINS_MAX,
  MOVIES_RUNTIME_MINS_MIN,
  MOVIES_SUMMARY_LENGTH_MAX,
  MOVIES_SUMMARY_LENGTH_MIN,
} from '../movies.constants';

export class UpdateMovieDTO {
  @IsString()
  @Length(MOVIES_NAME_LENGTH_MIN, MOVIES_NAME_LENGTH_MAX)
  @IsOptional()
  name: string;

  @IsString()
  @Length(MOVIES_SUMMARY_LENGTH_MIN, MOVIES_SUMMARY_LENGTH_MAX)
  @IsOptional()
  summary: string;

  @IsDate()
  @IsOptional()
  originallyReleasedAt: Date;

  @IsInt()
  @Min(MOVIES_RUNTIME_MINS_MIN)
  @Max(MOVIES_RUNTIME_MINS_MAX)
  @IsOptional()
  runtimeMinutes: number;
}
