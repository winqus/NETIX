import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Result } from '@ntx/common/Result';
import { NtxEvent } from '@ntx/events.constants';
import { ImportedInformationService } from '@ntx/external-search/imported-information.service';
import {
  MovieDetails,
  TitleDetailedSearchResult,
} from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { validateOrReject } from 'class-validator';
import MovieCreatedFromExternalSourceEvent from '../../common/events/MovieCreatedFromExternalSourceEvent';
import { NameCategory } from '../interfaces/nameCategory.enum';
import { CreateMovieTitleDTO } from './dto/CreateMovieTitle.dto';
import { MovieTitle } from './interfaces/movieTitle.interface';
import { MoviesRepository } from './movies.repository';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: MoviesRepository,
    private readonly extInfoService: ImportedInformationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async create(createDTO: CreateMovieTitleDTO): Promise<Result<MovieTitle>> {
    try {
      await validateOrReject(createDTO);

      const title: MovieTitle = {
        uuid: generateUUIDv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnails: [],
        names: createDTO.names,
        releaseDate: createDTO.releaseDate,
        type: TitleType.MOVIE,
        runtimeMinutes: createDTO.runtimeMinutes,
        video: undefined,
      };

      const newTitle = await this.repository.create(title);

      return Result.ok(newTitle);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async createFromExternalSource(externalTitle: TitleDetailedSearchResult): Promise<Result<MovieTitle>> {
    try {
      if (externalTitle == null || externalTitle.id == null || externalTitle.sourceUUID == null) {
        this.logger.error('No external source or id provided as args');

        return Result.fail('No external source or id');
      }

      const isAlreadyImported = (
        await this.extInfoService.isAlreadyImported(externalTitle.sourceUUID, externalTitle.id, TitleType.MOVIE)
      ).getValue();

      if (isAlreadyImported) {
        return Result.fail(
          `${externalTitle.type} title (${externalTitle.id}) from source (${externalTitle.sourceUUID}) already exists`,
        );
      }

      const createMovieDTO = new CreateMovieTitleDTO();
      createMovieDTO.names = [
        {
          type: NameCategory.Primary,
          value: externalTitle.title,
          language: '',
        },
      ];
      createMovieDTO.releaseDate = new Date(externalTitle.releaseDate);
      createMovieDTO.runtimeMinutes = (externalTitle.details as MovieDetails).runtime;

      const movieResult = await this.create(createMovieDTO);

      if (movieResult.isFailure) {
        return movieResult;
      }

      const createdMovie = movieResult.getValue();

      this.eventEmitter.emit(
        NtxEvent.MovieCreatedFromExternalSource,
        new MovieCreatedFromExternalSourceEvent(createdMovie, externalTitle),
      );

      return Result.ok(createdMovie);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  // TODO: Handle Video Created Event, assign video ID to title
  // @OnEvent(VIDEO_PROCESSED_EVENT)
  // private async handleVideoProcessedEvent(payload: VideoProcessedEvent) {
  //   const { titleID, videoID } = payload;

  //   const title = await this.moviesRepository.findOne({ uuid: titleID });

  //   if (title == null) {
  //     this.logger.error(`Title not found: ${titleID}`);

  //     return;
  //   }

  //   this.logger.log(`Assigned video ID ${videoID} to title ${titleID}`);
  // }
}
