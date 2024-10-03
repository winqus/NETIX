import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { PosterService } from '@ntx/images/poster.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import { Movie } from './entities/movie.entity';
import { MoviesMapper } from './movies.mapper';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesRepo: MoviesRepository,
    private readonly posterSrv: PosterService,
  ) {}

  public async createOneWithPoster(dto: CreateMovieDTO, posterFile: FileInStorage): Promise<MovieDTO> {
    try {
      if (posterFile == null) {
        throw new BadRequestException('posterFile can not be null or empty');
      }

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

      const posterID = await this.posterSrv.addCreatePosterJob(posterFile);

      const newMovie = await Movie.create({
        posterID: posterID,
        name: dto.name,
        originallyReleasedAt: dto.originallyReleasedAt,
        summary: dto.summary,
        runtimeMinutes: dto.runtimeMinutes,
      });

      await this.moviesRepo.create(newMovie);

      return MoviesMapper.Movie2MovieDTO(newMovie);
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

      return MoviesMapper.Movie2MovieDTO(movie);
    } catch (error) {
      this.logger.error(`Failed to find movie with this ${id}: ${error.message}`);
      throw error;
    }
  }
}
