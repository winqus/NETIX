import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { FilterQuery, Model } from 'mongoose';
import { Movie } from './entities/movie.entity';
import { MOVIES_MODEL_TOKEN } from './movies.constants';
import { MoviesMapper } from './movies.mapper';
import { MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesRepository extends EntityRepository<Movie> {
  constructor(@Inject(MOVIES_MODEL_TOKEN) private readonly model: Model<MovieDocument>) {
    super(model);
  }

  public async existsByID(uuid: string): Promise<boolean> {
    const query: FilterQuery<MovieDocument> = {
      uuid,
    };

    const count = await this.model.findOne(query);

    return count != null;
  }

  public async existsByHash(hash: string): Promise<boolean> {
    const query: FilterQuery<MovieDocument> = {
      hash,
    };

    const count = await this.model.findOne(query);

    return count != null;
  }

  public async updateOneByUUID(uuid: string, update: Partial<Movie>): Promise<Movie | null> {
    const query: FilterQuery<MovieDocument> = {
      uuid,
    };

    const updated = await this.model.findOneAndUpdate<MovieDocument>(query, update);

    return updated == null ? null : MoviesMapper.any2Movie(updated);
  }
}
