import { Injectable, Logger } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/CreateMovieDTO';
import { MovieDTO } from './dto/MovieDTO';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

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

    // TODO: Create Movie Entity
    // TODO: create poster
    // TODO: Save to repo

    const newMovieDTO = new MovieDTO();
    newMovieDTO.id = 'tempID';
    newMovieDTO.name = dto.name;
    newMovieDTO.summary = dto.summary;
    newMovieDTO.originallyReleasedAt = dto.originallyReleasedAt;
    newMovieDTO.runtimeMinutes = dto.runtimeMinutes;
    newMovieDTO.posterID = 'tempPosterID';

    return newMovieDTO;
  }
}
