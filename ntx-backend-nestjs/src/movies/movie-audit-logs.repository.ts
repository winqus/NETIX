import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { FilterQuery, Model } from 'mongoose';
import { MovieAuditLog } from './entities/movie-audit-log.entity';
import { MoviesAuditLogMapper } from './mappers/movie-audit-log.mapper';
import { EVENTS_MODEL_TOKEN } from './movies.constants';
import { MovieAuditLogDocument } from './schemas/movie-audit-log.schema';

@Injectable()
export class MovieAuditLogsRepository extends EntityRepository<MovieAuditLog> {
  constructor(@Inject(EVENTS_MODEL_TOKEN) private readonly model: Model<MovieAuditLogDocument>) {
    super(model);
  }

  public async findByMovieId(movieId: string): Promise<MovieAuditLog[]> {
    const query: FilterQuery<MovieAuditLogDocument> = { movieId };
    const logs = await this.model.find(query).sort({ createdAt: -1 }).exec();

    return await MoviesAuditLogMapper.any2MovieAuditLogs(logs);
  }

  public async createLog(log: MovieAuditLog): Promise<MovieAuditLog> {
    const created = await super.create(log);

    return await MoviesAuditLogMapper.any2MovieAuditLog(created);
  }
}
