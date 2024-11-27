import { AuditLogDTO, MovieEvent } from '../models/auditLog.dto';
import { MovieDTO } from '../models/movie.dto';

export class AuditLogDTOMapper {
  static anyToAuditLogDTOArray(items: any[]): AuditLogDTO[] {
    return items.map((item) => this.anyToAuditLogDTO(item));
  }

  static anyToAuditLogDTO(item: any): AuditLogDTO {
    return {
      id: item.id,
      event: item.event as MovieEvent,
      movieId: item.movieId,
      changes: this.mapChanges(item.changes),
      timestamp: new Date(item.timestamp).toISOString(),
      userID: item.userID,
      username: item.username,
    };
  }

  private static mapChanges(changes: any): Partial<MovieDTO> | undefined {
    if (!changes || typeof changes !== 'object') {
      return undefined;
    }

    const mappedChanges: Partial<MovieDTO> = {};

    for (const key in changes) {
      if (changes[key] !== undefined) {
        mappedChanges[key as keyof MovieDTO] = changes[key];
      }
    }

    return mappedChanges;
  }
}
