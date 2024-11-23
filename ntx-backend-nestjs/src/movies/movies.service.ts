import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { FileInStorage } from '@ntx/file-storage/types';
import { BackdropsService } from '@ntx/images/backdrops.service';
import { PosterSize } from '@ntx/images/images.types';
import { PostersService } from '@ntx/images/posters.service';
import { VideosService } from '@ntx/videos/videos.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieSearchResultDTO } from './dto/movie-search-result.dto';
import { MovieDTO } from './dto/movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import {
  MovieBackdropUpdatedEvent,
  MovieCreatedEvent,
  MovieDeletedEvent,
  MovieEvent,
  MoviePosterUpdatedEvent,
  MovieUpdatedEvent,
} from './events/movies.events';
import { MoviesMapper } from './mappers/movies.mapper';
import { MOVIES_NO_FILE_PROVIDED_ERROR, MOVIES_NO_ID_PROVIDED_ERROR, MOVIES_NOT_FOUND_ERROR } from './movies.constants';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesRepo: MoviesRepository,
    private readonly postersSrv: PostersService,
    private readonly backdropsSrv: BackdropsService,
    private readonly videosSrv: VideosService,
    private readonly eventEmitter: EventEmitter2,
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
      this.eventEmitter.emit(MovieEvent.Created, new MovieCreatedEvent(newMovie.uuid));

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

      const posterID = await this.postersSrv.addCreatePosterJob(posterFile);

      const newMovie = await Movie.create({
        posterID: posterID,
        name: dto.name,
        originallyReleasedAt: dto.originallyReleasedAt,
        summary: dto.summary,
        runtimeMinutes: dto.runtimeMinutes,
      });

      await this.moviesRepo.createOne(newMovie);

      this.eventEmitter.emit(MovieEvent.Created, new MovieCreatedEvent(newMovie.uuid));

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

      this.eventEmitter.emit(MovieEvent.Updated, new MovieUpdatedEvent(id, dto));

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

      const posterID = await this.postersSrv.addCreatePosterJob(posterFile);

      movie.posterID = posterID;
      await this.moviesRepo.updateOneByUUID(id, movie);

      this.eventEmitter.emit(MovieEvent.PosterUpdated, new MoviePosterUpdatedEvent(id, movie.posterID));

      return MoviesMapper.Movie2MovieDTO(movie);
    } catch (error) {
      this.logger.error(`Failed to replace poster for movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async updateBackdropForOne(id: string, backdropFile: FileInStorage): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (backdropFile == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);
      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      const backdropID = await this.backdropsSrv.addCreateBackdropJob(backdropFile);

      movie.backdropID = backdropID;
      await this.moviesRepo.updateOneByUUID(id, movie);

      this.eventEmitter.emit(MovieEvent.BackdropUpdated, new MovieBackdropUpdatedEvent(id, movie.backdropID));

      return MoviesMapper.Movie2MovieDTO(movie);
    } catch (error) {
      this.logger.error(`Failed to replace backdrop for movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async updateVideoForOne(id: string, videoFile: FileInStorage): Promise<MovieDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (videoFile == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);
      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      if (movie.videoID) {
        await this.videosSrv.addDeleteVideoJob(movie.videoID).catch((error) => {
          this.logger.error(`Failed to delete video (${movie.videoID}): ${error.message}`);
        });
      }

      const videoName = `${movie.name} ${movie.originallyReleasedAt.getFullYear()}`;
      const video = await this.videosSrv.createOneFromFile(videoName, videoFile);

      movie.videoID = video.uuid;
      await this.moviesRepo.updateOneByUUID(id, movie);

      this.eventEmitter.emit(MovieEvent.VideoUpdated, new MovieUpdatedEvent(id, { videoID: movie.videoID }));

      return MoviesMapper.Movie2MovieDTO(movie);
    } catch (error) {
      this.logger.error(`Failed to update video for the movie ${id}: ${error.message}`);
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

  public async findAll(): Promise<MovieDTO[]> {
    try {
      const movies = await this.moviesRepo.findAllSortedByReleaseDate();

      return MoviesMapper.Movies2MovieDTOs(movies);
    } catch (error) {
      this.logger.error(`Failed to find movies sorted by release date: ${error.message}`);
      throw error;
    }
  }

  public async findAllByName(name: string): Promise<MovieSearchResultDTO[]> {
    try {
      name = name.trim();
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
          id: movie.uuid,
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

  public async publishOne(id: string): Promise<MovieDTO> {
    return this.togglePublishedForOne(id, true);
  }

  public async unpublishOne(id: string): Promise<MovieDTO> {
    return this.togglePublishedForOne(id, false);
  }

  private async togglePublishedForOne(id: string, isPublished: boolean): Promise<MovieDTO> {
    try {
      id = id.trim();

      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);
      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      movie.isPublished = isPublished;
      const updatedMovie = await this.moviesRepo.updateOneByUUID(id, movie);

      const eventType = isPublished ? MovieEvent.Published : MovieEvent.Unpublished;
      this.eventEmitter.emit(eventType, { id });

      return MoviesMapper.Movie2MovieDTO(updatedMovie!);
    } catch (error) {
      this.logger.error(`Failed to publish movie with this ${id}: ${error.message}`);
      throw error;
    }
  }

  public async deleteOne(id: string) {
    try {
      if (id == null) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      const movie = await this.moviesRepo.findOneByUUID(id);

      if (movie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      if (movie.videoID) {
        await this.videosSrv.addDeleteVideoJob(movie.videoID).catch((error) => {
          this.logger.error(`Failed to delete video (${movie.videoID}): ${error.message}`);
        });
      }

      if (movie.posterID) {
        this.postersSrv.deleteOne(movie.posterID).catch((error) => {
          this.logger.error(`Failed to delete poster (${movie.posterID}): ${error.message}`);
        });
      }

      if (movie.backdropID) {
        this.backdropsSrv.deleteOne(movie.backdropID).catch((error) => {
          this.logger.error(`Failed to delete backdrop (${movie.backdropID}): ${error.message}`);
        });
      }

      await this.moviesRepo.deleteOneByUUID(id);
      this.eventEmitter.emit(MovieEvent.Deleted, new MovieDeletedEvent(id));
    } catch (error) {
      this.logger.error(`Failed to delete movie (${id}): ${error.message}`);
      throw error;
    }
  }
}
