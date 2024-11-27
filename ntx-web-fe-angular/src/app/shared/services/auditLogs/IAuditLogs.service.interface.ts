import { Observable } from 'rxjs/internal/Observable';
import { AuditLogDTO } from '@ntx-shared/models/auditLog.dto';

export interface IAuditLogs {
  getMovieAuditLogs(id: string): Observable<AuditLogDTO[]>;
}
