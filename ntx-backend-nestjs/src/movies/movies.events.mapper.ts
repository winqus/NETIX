import { AuditLog } from './entities/movie.event.entity';

export class MoviesAuditLogMapper {
  public static toAuditLogDTO(auditLog: AuditLog): any {
    return {
      id: auditLog.uuid,
      event: auditLog.event,
      movieId: auditLog.movieId,
      changes: auditLog.changes,
      timestamp: auditLog.createdAt.toISOString(),
    };
  }

  public static toAuditLogDTOs(auditLogs: AuditLog[]): any[] {
    return auditLogs.map((log) => this.toAuditLogDTO(log));
  }
}
