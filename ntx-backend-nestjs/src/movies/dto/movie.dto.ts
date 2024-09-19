import { IsDate, IsInt, IsString, Length, Max, Min } from 'class-validator';
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

  @IsString()
  @Length(MOVIES_NAME_LENGTH_MIN, MOVIES_NAME_LENGTH_MAX)
  name: string;

  @IsString()
  @Length(MOVIES_SUMMARY_LENGTH_MIN, MOVIES_SUMMARY_LENGTH_MAX)
  summary: string;

  @IsDate()
  originallyReleasedAt: Date;

  @IsInt()
  @Min(MOVIES_RUNTIME_MINS_MIN)
  @Max(MOVIES_RUNTIME_MINS_MAX)
  runtimeMinutes: number;

  @IsString()
  posterID: string;
}
