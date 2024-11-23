import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { FilterQuery, Model } from 'mongoose';
import { AuditLog } from './entities/movie.event.entity';
import { EVENTS_MODEL_TOKEN } from './movies.constants';
import { AuditLogDocument } from './schemas/movies.event.schema';

@Injectable()
export class AuditLogRepository extends EntityRepository<AuditLog> {
  constructor(@Inject(EVENTS_MODEL_TOKEN) private readonly model: Model<AuditLogDocument>) {
    super(model);
  }

  public async findByMovieId(movieId: string): Promise<AuditLog[]> {
    const query: FilterQuery<AuditLogDocument> = { movieId };
    const logs = await this.model.find(query).sort({ createdAt: -1 }).exec();

    return logs;
  }

  public async createLog(log: AuditLog): Promise<AuditLog> {
    const created = await super.create(log);

    return created;
  }
}
