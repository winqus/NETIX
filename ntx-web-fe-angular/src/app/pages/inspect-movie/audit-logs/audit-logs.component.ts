import { Component, Input, OnChanges } from '@angular/core';
import { AuditLogDTO, MovieEvent } from '@ntx-shared/models/auditLog.dto';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { AuditLogService } from '@ntx-shared/services/auditLogs/auditLogs.service';
import { formatTimestamp } from '@ntx-shared/services/utils/utils';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons.component';
import { environment } from '@ntx/environments/environment';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
})
export class AuditLogsComponent implements OnChanges {
  @Input({ required: true }) movie: MovieDTO | undefined;
  auditLogs: AuditLogDTO[] = [];

  constructor(private readonly auditLogService: AuditLogService) {}
  ngOnChanges(): void {
    if (this.movie?.id) {
      this.getMovieAuditLogs();
    }
  }

  getMovieAuditLogs() {
    if (this.movie?.id == null) return;

    this.auditLogService.getMovieAuditLogs(this.movie?.id).subscribe({
      next: (response) => {
        this.auditLogs = response;
        console.log(this.auditLogs);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error getting audit logs:', errorResponse);
      },
    });
  }

  getAuditLogTimestamp(timestamp: string): string {
    return formatTimestamp(timestamp);
  }

  getEventLabel(event: MovieEvent): string {
    return event
      .replace(/\./g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim();
  }

  getEventIconName(event: MovieEvent): string {
    switch (event) {
      case MovieEvent.Created:
        return 'plus';
      case MovieEvent.Updated:
        return 'repeat';
      case MovieEvent.Published:
        return 'bookmark_plus';
      case MovieEvent.Unpublished:
        return 'bookmark_x';
      case MovieEvent.BackdropUpdated:
        return 'card_image';
      case MovieEvent.PosterUpdated:
        return 'file_image';
      case MovieEvent.VideoUpdated:
        return 'film';
      case MovieEvent.Deleted:
        return 'trash';
      default:
        return '';
    }
  }
}
