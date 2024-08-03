import { Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Result } from '@ntx/common/Result';
import { validateOrReject } from 'class-validator';
import { CreateMovieTitleDTO } from './dto/CreateMovieTitle.dto';
import { CreateSeriesTitleDTO } from './dto/CreateSeriesTitle.dto';
import { MovieDetails } from './interfaces/movieDetails.interface';
import { SeriesDetails } from './interfaces/seriesDetails.interface';
import { Title } from './interfaces/title.interface';
import { TitlesRepository } from './titles.repository';

@Injectable()
export class TitlesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly titlesRepository: TitlesRepository) {}

  public async createMovie(createMovieDto: CreateMovieTitleDTO): Promise<Result<Title>> {
    try {
      await validateOrReject(createMovieDto);

      const title: Title = {
        type: TitleType.MOVIE,
        thumbnails: [],
        names: createMovieDto.names,
        releaseDate: createMovieDto.releaseDate,
        details: {
          runtimeMinutes: createMovieDto.runtimeMinutes,
        } as MovieDetails,
      } as any;

      const newTitle = await this.titlesRepository.create(title);

      this.logger.log(`Created new movie title: ${newTitle.uuid}`);

      return Result.ok(newTitle);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async createSeries(createDTO: CreateSeriesTitleDTO): Promise<Result<Title>> {
    try {
      await validateOrReject(createDTO);

      const title: Title = {
        type: TitleType.SERIES,
        thumbnails: [],
        names: createDTO.names,
        releaseDate: createDTO.releaseDate,
        details: {} as SeriesDetails,
      } as any;

      const newTitle = await this.titlesRepository.create(title);

      this.logger.log(`Created new series title: ${newTitle.uuid}`);

      return Result.ok(newTitle);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
  // TODO: Handle Video Created Event, assign video ID to title
  // @OnEvent(VIDEO_PROCESSED_EVENT)
  // async handleVideoProcessedEvent(payload: VideoProcessedEvent) {
  //  some logic
  // }

  // TODO: Handle Thumbnail Created Event, assign thumbnail ID to title
}
