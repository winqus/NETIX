import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { FileInStorage } from '@ntx/file-storage/types';
import { PosterSize } from '@ntx/images/images.types';
import { PosterService } from '@ntx/images/poster.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieSearchResultDTO } from './dto/movie-search-result.dto';
import { MovieDTO } from './dto/movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MOVIES_NO_FILE_PROVIDED_ERROR, MOVIES_NO_ID_PROVIDED_ERROR, MOVIES_NOT_FOUND_ERROR } from './movies.constants';
import { MoviesMapper } from './movies.mapper';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesRepo: MoviesRepository,
    private readonly posterSrv: PosterService,
  ) {}

  public async createOne(dto: CreateMovieDTO): Promise<MovieDTO> {
    try {
      try {
        await validateOrReject(dto);
      } catch (error) {
        this.logger.error('Invalid CreateMovieDTO');
        throw new BadRequestException(error);
      }

      const movieHash = Movie.createHash(dto);

      const alreadyExists = await this.moviesRepo.existsByHash(movieHash);
      if (alreadyExists) {
        this.logger.error(`Movie with hash ${movieHash} already exists.`);
        throw new ConflictException(`Movie with these contents already exists`);
      }

      const newMovie = await Movie.create({
        name: dto.name,
        originallyReleasedAt: dto.originallyReleasedAt,
        summary: dto.summary,
        runtimeMinutes: dto.runtimeMinutes,
      });

      await this.moviesRepo.createOne(newMovie);

      return MoviesMapper.Movie2MovieDTO(newMovie);
    } catch (error) {
      this.logger.error(`Failed to create movie ${dto.name}: ${error.message}`);
      throw error;
    }
  }

  public async createOneWithPoster(dto: CreateMovieDTO, posterFile: FileInStorage): Promise<MovieDTO> {
    try {
      if (posterFile == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      try {
        await validateOrReject(dto);
      } catch (error) {
        this.logger.error('Invalid CreateMovieDTO');
        throw new BadRequestException(error);
      }

      const movieHash = Movie.createHash({ name: dto.name, originallyReleasedAt: dto.originallyReleasedAt });
      const alreadyExists = await this.moviesRepo.existsByHash(movieHash);
      if (alreadyExists) {
        this.logger.error(`Movie ${dto.name} with hash ${movieHash} already exists.`);
        throw new ConflictException(`Movie with these contents already exists`);
      }

      const posterID = await this.posterSrv.addCreatePosterJob(posterFile);

      const newMovie = await Movie.create({
        posterID: posterID,
        name: dto.name,
        originallyReleasedAt: dto.originallyReleasedAt,
        summary: dto.summary,
        runtimeMinutes: dto.runtimeMinutes,
      });

      await this.moviesRepo.createOne(newMovie);

      return MoviesMapper.Movie2MovieDTO(newMovie);
    } catch (error) {
      this.logger.error(`Failed to create movie ${dto.name}: ${error.message}`);
      throw error;
    }
  }

  public async updateOne(id: string, dto: UpdateMovieDTO): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      try {
        await validateOrReject(dto);
      } catch (error) {
        this.logger.error('Invalid UpdateMovieDTO');
        throw new BadRequestException(error);
      }

      const movieUpdate: Partial<Movie> = {
        name: dto.name,
        originallyReleasedAt: dto.originallyReleasedAt,
        runtimeMinutes: dto.runtimeMinutes,
        summary: dto.summary,
      };

      const updatedMovie = await this.moviesRepo.updateOneByUUID(id, movieUpdate);
      if (updatedMovie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      return MoviesMapper.Movie2MovieDTO(updatedMovie);
    } catch (error) {
      this.logger.error(`Failed to update movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async updatePosterForOne(id: string, posterFile: FileInStorage): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (posterFile == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);
      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      const posterID = await this.posterSrv.addCreatePosterJob(posterFile);

      movie.posterID = posterID;
      await this.moviesRepo.updateOneByUUID(id, movie);

      return MoviesMapper.Movie2MovieDTO(movie);
    } catch (error) {
      this.logger.error(`Failed to replace poster for movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async findOne(id: string): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);

      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      return MoviesMapper.Movie2MovieDTO(movie);
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
        this.logger.warn(`No movies found with the given name "${name}"`);

        return [];
      }

      const movieSearchResults: MovieSearchResultDTO = {
        size: movies.length,
        results: movies.map((movie) => ({
          type: TitleType.MOVIE,
          metadata: {
            name: movie.name,
            originalName: movie.name,
            summary: movie.summary,
            releaseDate: movie.originallyReleasedAt.toISOString(),
            runtimeMinutes: movie.runtimeMinutes,
          },
          weight: 1,
          posterURL: movie.posterID ? `/api/v1/poster/${movie.posterID}?size=${PosterSize.XS}` : undefined,
          backdropURL: undefined,
        })),
      };

      return [movieSearchResults];
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
