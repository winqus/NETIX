import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { AuditLogDTO } from '@ntx-shared/models/auditLog.dto';
import { getAuditLogs } from '@ntx-shared/config/api-endpoints';
import { AuditLogDTOMapper } from '@ntx-shared/mappers/AuditLogDTO.mapper';
import { IAuditLogs } from './IAuditLogs.service.interface';

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService implements IAuditLogs {
  constructor(private readonly http: HttpClient) {}
  getMovieAuditLogs(id: string): Observable<AuditLogDTO[]> {
    const url = getAuditLogs(id);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return AuditLogDTOMapper.anyToAuditLogDTOArray(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
