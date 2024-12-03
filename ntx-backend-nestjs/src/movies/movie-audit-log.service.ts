import { Injectable } from '@nestjs/common';
import { MovieAuditLogDTO } from './dto/movie-audit-log.dto';
import { MoviesAuditLogMapper } from './mappers/movie-audit-log.mapper';
import { MovieAuditLogsRepository } from './movie-audit-logs.repository';

@Injectable()
export class MovieAuditLogService {
  constructor(private readonly auditLogRepo: MovieAuditLogsRepository) {}

  async findAllByMovieId(movieID: string): Promise<MovieAuditLogDTO[]> {
    const logs = await this.auditLogRepo.findByMovieId(movieID);

    if (!logs || logs.length === 0) {
      return [];
    }

    return await MoviesAuditLogMapper.MovieAuditLog2MovieAuditLogDTOs(logs);
  }
}
