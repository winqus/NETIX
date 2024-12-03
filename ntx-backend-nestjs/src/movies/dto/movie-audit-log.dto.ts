import { IsDate, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MovieEvent } from '../events/movies.events';

export class MovieAuditLogDTO {
  @IsString()
  id: string;

  @IsEnum(MovieEvent)
  event: MovieEvent;

  @IsString()
  movieID: string;

  @IsObject()
  @IsOptional()
  changes: Record<string, any>;

  @IsDate()
  timestamp: Date;

  @IsString()
  userID: string;

  @IsString()
  username: string;
}
