import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { MovieAuditLogDTO } from '../dto/movie-audit-log.dto';
import { MovieAuditLog } from '../entities/movie-audit-log.entity';

export class MoviesAuditLogMapper {
  public static async any2MovieAuditLog(any: any): Promise<MovieAuditLog> {
    const auditLog = await createValidatedObject(MovieAuditLog, {
      uuid: any.uuid,
      event: any.event,
      movieID: any.movieID,
      changes: any.changes,
      createdAt: any.createdAt,
      userID: any.userID,
      username: any.username,
    });

    return auditLog;
  }

  public static async any2MovieAuditLogs(any: any[]): Promise<MovieAuditLog[]> {
    return await Promise.all(any.map((a) => MoviesAuditLogMapper.any2MovieAuditLog(a)));
  }

  public static async MovieAuditLog2MovieAuditLogDTO(auditLog: MovieAuditLog): Promise<MovieAuditLogDTO> {
    const auditLogDTO = await createValidatedObject(MovieAuditLogDTO, {
      id: auditLog.uuid,
      event: auditLog.event,
      movieID: auditLog.movieID,
      changes: auditLog.changes,
      timestamp: auditLog.createdAt,
      userID: auditLog.userID,
      username: auditLog.username,
    });

    return auditLogDTO;
  }

  public static async MovieAuditLog2MovieAuditLogDTOs(auditLogs: MovieAuditLog[]): Promise<MovieAuditLogDTO[]> {
    return await Promise.all(auditLogs.map((log) => this.MovieAuditLog2MovieAuditLogDTO(log)));
  }
}
