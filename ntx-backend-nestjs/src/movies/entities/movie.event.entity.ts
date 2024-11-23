import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsObject, IsString } from 'class-validator';

export interface AuditLogProps {
  uuid?: string;
  event: string;
  movieId: string;
  changes: Record<string, any>;
  createdAt?: Date;
}

export class AuditLog {
  @IsString()
  uuid: string;

  @IsString()
  event: string; // e.g., 'movie.updated', 'movie.deleted'

  @IsString()
  movieId: string;

  @IsObject()
  changes: Record<string, any>;

  @IsDate()
  createdAt: Date;

  public static async create(props: AuditLogProps): Promise<AuditLog> {
    const log = {
      uuid: generateUniqueID('AUDIT_LOG', 20),
      event: props.event,
      movieId: props.movieId,
      changes: props.changes,
      createdAt: props.createdAt || new Date(),
    };

    return createValidatedObject(AuditLog, log);
  }
}
