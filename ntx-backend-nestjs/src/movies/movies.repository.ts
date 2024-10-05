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

  public async findAllByName(name: string): Promise<Movie[]> {
    const query: FilterQuery<MovieDocument> = {
      name: { $regex: new RegExp(name, 'i') },
    };

    const movieDocuments = await this.model.find(query).exec();

    const movies: Movie[] = movieDocuments.map(this.mapMovieDocumentToMovie);

    return movies;
  }

  public async createOne(movie: Movie): Promise<Movie> {
    const created = await super.create(movie);

    return MoviesMapper.any2Movie(created);
  }

  public async existsByUUID(uuid: string): Promise<boolean> {
    const query: FilterQuery<MovieDocument> = { uuid };

    return super.exists(query);
  }

  public async existsByHash(hash: string): Promise<boolean> {
    const query: FilterQuery<MovieDocument> = { hash };

    return super.exists(query);
  }

  public async findOneByUUID(uuid: string): Promise<Movie | null> {
    const query: FilterQuery<MovieDocument> = { uuid };
    const found = await super.findOne(query);

    return found == null ? null : MoviesMapper.any2Movie(found);
  }

  public async updateOneByUUID(uuid: string, update: Partial<Movie>): Promise<Movie | null> {
    const query: FilterQuery<MovieDocument> = { uuid };
    const updated = await super.findOneAndUpdate(query, update);

    return updated == null ? null : MoviesMapper.any2Movie(updated);
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
