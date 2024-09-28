import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { FilterQuery, Model } from 'mongoose';
import { Movie } from './entities/movie.entity';
import { MOVIES_MODEL_TOKEN } from './movies.constants';
import { MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesRepository extends EntityRepository<Movie> {
  constructor(@Inject(MOVIES_MODEL_TOKEN) private readonly model: Model<MovieDocument>) {
    super(model);
  }

  public async findAllByName(name: string): Promise<MovieDocument[]> {
    const query: FilterQuery<MovieDocument> = {
      name: { $regex: new RegExp(name, 'i') },
    };

    return this.model.find(query).exec();
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
}
