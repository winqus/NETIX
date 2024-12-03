import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MovieEvent } from '../events/movies.events';
import { AUDIT_LOG_ID_LENGTH, AUDIT_LOG_ID_PREFIX } from '../movies.constants';

export interface MovieAuditLogProps {
  uuid?: string;
  event: MovieEvent;
  movieID: string;
  changes: Record<string, any>;
  createdAt?: Date;
  userID: string;
  username: string;
}

export class MovieAuditLog {
  @IsString()
  uuid: string;

  @IsEnum(MovieEvent)
  event: MovieEvent;

  @IsString()
  movieID: string;

  @IsObject()
  @IsOptional()
  changes: Record<string, any>;

  @IsDate()
  createdAt: Date;

  @IsString()
  userID: string;

  @IsString()
  username: string;

  public static async create(props: MovieAuditLogProps): Promise<MovieAuditLog> {
    const log = {
      uuid: generateUniqueID(AUDIT_LOG_ID_PREFIX, AUDIT_LOG_ID_LENGTH),
      event: props.event,
      movieID: props.movieID,
      changes: props.changes,
      createdAt: props.createdAt || new Date(),
      userID: props.userID,
      username: props.username,
    };

    return await createValidatedObject(MovieAuditLog, log);
  }
}
