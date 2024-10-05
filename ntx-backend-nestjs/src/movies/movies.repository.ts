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

  public async findAllByName(name: string): Promise<Movie[]> {
    const query: FilterQuery<MovieDocument> = {
      name: { $regex: new RegExp(name, 'i') },
    };

    const movieDocuments = await this.model.find(query).exec();

    const movies: Movie[] = movieDocuments.map(this.mapMovieDocumentToMovie);

    return movies;
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

  private mapMovieDocumentToMovie(document: MovieDocument): Movie {
    return {
      uuid: document.uuid,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      posterID: document.posterID,
      name: document.name,
      type: document.type,
      hash: document.hash,
      originallyReleasedAt: document.originallyReleasedAt,
      summary: document.summary,
      runtimeMinutes: document.runtimeMinutes,
      videoID: document.videoID,
    };
  }
}
