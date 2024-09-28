import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { FileInStorage } from '@ntx/file-storage/types';
import { PosterService } from '@ntx/images/poster.service';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieSearchResultDTO } from './dto/movie-search-result.dto';
import { MovieDTO } from './dto/movie.dto';
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
    try {
      if (posterFile == null) {
        throw new BadRequestException('posterFile can not be null or empty');
      }

      try {
        await validateOrReject(dto);
      } catch (error) {
        this.logger.error('Invalid CreateMovieManuallyDTO');
        throw new BadRequestException(error);
      }

      const movieHash = this.createMovieHash(dto);

      const alreadyExists = await this.moviesRepo.existsByHash(movieHash);
      if (alreadyExists) {
        this.logger.error(`Movie with hash ${movieHash} already exists.`);
        throw new ConflictException(`Movie with these contents already exists`);
      }

      const posterID = await this.posterSrv.addCreatePosterJob(posterFile);

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
        hash: movieHash,
      });

      await this.moviesRepo.create(newMovie);

      const newMovieDTO = createValidatedObject(MovieDTO, {
        id: newMovie.uuid,
        createdAt: newMovie.createdAt,
        updatedAt: newMovie.updatedAt,
        name: newMovie.name,
        summary: newMovie.summary,
        originallyReleasedAt: newMovie.originallyReleasedAt,
        runtimeMinutes: newMovie.runtimeMinutes,
        posterID: newMovie.posterID,
        videoID: newMovie.videoID,
      });

      return newMovieDTO;
    } catch (error) {
      this.logger.error(`Failed to create movie ${dto.name}: ${error.message}`);
      throw error;
    }
  }

  public async findOne(id: string): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException('id can not be null');
      }

      const movie = await this.moviesRepo.findByUUID(id);

      if (movie == null) {
        throw new BadRequestException('requested movie does not exist');
      }

      const movieDTO = createValidatedObject(MovieDTO, {
        id: movie.uuid,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
        name: movie.name,
        summary: movie.summary,
        originallyReleasedAt: movie.originallyReleasedAt,
        runtimeMinutes: movie.runtimeMinutes,
        posterID: movie.posterID,
        videoID: movie.videoID,
      });

      return movieDTO;
    } catch (error) {
      this.logger.error(`Failed to find movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async findAllByName(name: string): Promise<MovieSearchResultDTO[]> {
    try {
      if (!name) {
        throw new BadRequestException('name can not be null or empty');
      }

      const movies = await this.moviesRepo.findAllByName(name);

      if (!movies.length) {
        throw new BadRequestException('No movies found with the given name');
      }

      const movieSearchResults = movies.map((movie) => {
        return {
          providerID: 'ntx' as const, // Literal type 'ntx'
          resultWeight: 1 as const, // Literal type 1
          shortMovieMetadata: {
            title: movie.name,
            type: movie.type,
            releaseDate: movie.originallyReleasedAt.toISOString(),
            posterID: movie.posterID || '', // Handle optional posterID
          },
        };
      });

      return movieSearchResults;
    } catch (error) {
      this.logger.error(`Failed to find movies by name "${name}": ${error.message}`);
      throw error;
    }
  }

  private createMovieHash({
    name,
    originallyReleasedAt,
    runtimeMinutes,
  }: Pick<Movie, 'name' | 'originallyReleasedAt' | 'runtimeMinutes'>): string {
    return generateHash(name, originallyReleasedAt.toDateString(), runtimeMinutes.toString());
  }
}
