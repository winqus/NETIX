import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsObject, IsOptional, IsString } from 'class-validator';
import { AUDIT_LOG_ID_LENGTH, AUDIT_LOG_ID_PREFIX } from '../movies.constants';

export interface MovieAuditLogProps {
  uuid?: string;
  event: string;
  movieId: string;
  changes: Record<string, any>;
  createdAt?: Date;
}

export class MovieAuditLog {
  @IsString()
  uuid: string;

  @IsString()
  event: string;

  @IsString()
  movieId: string;

  @IsObject()
  @IsOptional()
  changes: Record<string, any>;

  @IsDate()
  createdAt: Date;

  public static async create(props: MovieAuditLogProps): Promise<MovieAuditLog> {
    const log = {
      uuid: generateUniqueID(AUDIT_LOG_ID_PREFIX, AUDIT_LOG_ID_LENGTH),
      event: props.event,
      movieId: props.movieId,
      changes: props.changes,
      createdAt: props.createdAt || new Date(),
    };

    return await createValidatedObject(MovieAuditLog, log);
  }
}
