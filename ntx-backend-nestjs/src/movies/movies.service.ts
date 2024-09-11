import { Injectable, Logger } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/CreateMovieDTO';
import { MovieDTO } from './dto/MovieDTO';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

  public async createMovieManually(dto: CreateMovieDTO, posterFileID: string): Promise<MovieDTO> {
    if (posterFileID == null || posterFileID == '') {
      throw new Error('posterFileID can not be null or empty');
    }

    try {
      await validateOrReject(dto);
    } catch (error) {
      this.logger.error('Invalid CreateMovieManuallyDTO');
      throw error;
    }

    // TODO: Movie creation logic

    const newMovieDTO = new MovieDTO();
    newMovieDTO.id = 'tempID';
    newMovieDTO.name = 'tempName';
    newMovieDTO.summary = 'tempsummary';
    newMovieDTO.originallyReleasedAt = new Date();
    newMovieDTO.runtimeMinutes = 123;
    newMovieDTO.posterID = 'tempPosterID';

    return newMovieDTO;
  }
}
