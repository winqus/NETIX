import { Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { createValidatedObject } from '@ntx/common/utils/classValidationUtils';
import { FileInStorage } from '@ntx/file-storage/types';
import { PosterService } from '@ntx/images/poster.service';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/CreateMovieDTO';
import { MovieDTO } from './dto/MovieDTO';
import { Movie } from './entities/movie.entity';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesRepo: MoviesRepository,
    private readonly posterSrv: PosterService,
  ) {}

  public async createMovie(dto: CreateMovieDTO, posterFile: FileInStorage): Promise<MovieDTO> {
    if (posterFile == null) {
      throw new Error('posterFile can not be null or empty');
    }

    try {
      await validateOrReject(dto);
    } catch (error) {
      this.logger.error('Invalid CreateMovieManuallyDTO');
      throw error;
    }

    const posterID = await this.posterSrv.createPoster(posterFile);

    const newMovie = await createValidatedObject(Movie, {
      uuid: generateUUIDv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      posterID: posterID,
      name: dto.name,
      type: TitleType.MOVIE,
      originallyReleasedAt: dto.originallyReleasedAt,
      summary: dto.summary,
      runtimeMinutes: dto.runtimeMinutes,
    } as Movie);

    await this.moviesRepo.create(newMovie);

    const newMovieDTO = createValidatedObject(MovieDTO, {
      id: newMovie.uuid,
      name: newMovie.name,
      summary: newMovie.summary,
      originallyReleasedAt: newMovie.originallyReleasedAt,
      runtimeMinutes: newMovie.runtimeMinutes,
      posterID: newMovie.posterID,
    } as MovieDTO);

    return newMovieDTO;
  }
}
