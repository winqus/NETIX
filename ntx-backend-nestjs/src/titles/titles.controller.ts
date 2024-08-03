import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleSearchService } from '@ntx/external-search/external-title-search.service';
import { ImportedInformationService } from '@ntx/external-search/imported-information.service';
import {
  MovieDetails,
  TitleDetailedSearchResult,
} from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { validateOrReject } from 'class-validator';
import { CreateMovieTitleDTO } from './dto/CreateMovieTitle.dto';
import { CreateSeriesTitleDTO } from './dto/CreateSeriesTitle.dto';
import { CreateTitleFromExternalSourceDTO } from './dto/CreateTitleFromExternalSource.dto';
import { NameCategory } from './interfaces/nameCategory.enum';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION } from './titles.constants';
import { TitlesService } from './titles.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TitlesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly titlesService: TitlesService,
    private readonly extTitleSearchService: ExternalTitleSearchService,
    private readonly extInfoService: ImportedInformationService,
  ) {}

  @Post()
  public async createTitleFromExternalSource(@Body() createTitleFromExt: CreateTitleFromExternalSourceDTO) {
    try {
      await validateOrReject(createTitleFromExt);

      const alreadyExists = (
        await this.extInfoService.isAlreadyImported(
          createTitleFromExt.externalSourceUUID,
          createTitleFromExt.externalTitleID,
        )
      ).getValue();

      if (alreadyExists) {
        throw new BadRequestException(
          `${createTitleFromExt.type} title (${createTitleFromExt.externalTitleID}) from source ` +
            `(${createTitleFromExt.externalSourceUUID}) already exists`,
        );
      }

      const externalDetailsResult = await this.extTitleSearchService.searchDetailsByTitleId(
        createTitleFromExt.externalTitleID,
        createTitleFromExt.type,
        createTitleFromExt.externalSourceUUID as any,
      );

      if (externalDetailsResult.isFailure) {
        throw new BadRequestException(externalDetailsResult.errorValue());
      }

      const externalTitle = externalDetailsResult.getValue();

      switch (createTitleFromExt.type) {
        case TitleType.MOVIE: {
          const newMovie = this.createMovieTitleFromExternalSource(externalTitle);

          return newMovie;
        }
        case TitleType.SERIES: {
          const newSeries = this.createSeriesTitleFromExternalSource(externalTitle);

          return newSeries;
        }
        default: {
          throw new BadRequestException('Invalid title type');
        }
      }
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.debug(error.stack);
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  private async createMovieTitleFromExternalSource(externalTitle: TitleDetailedSearchResult) {
    const movieDetails = externalTitle.details as MovieDetails;

    const newMovieTitle = new CreateMovieTitleDTO();
    newMovieTitle.type = TitleType.MOVIE;
    newMovieTitle.names = [
      {
        type: NameCategory.Primary,
        value: externalTitle.title,
        language: '',
      },
    ];
    newMovieTitle.releaseDate = new Date(externalTitle.releaseDate);
    newMovieTitle.runtimeMinutes = movieDetails.runtime;

    const movieResult = await this.titlesService.createMovie(newMovieTitle);

    if (movieResult.isFailure) {
      throw new BadRequestException(movieResult.errorValue());
    }

    const newMovie = movieResult.getValue();

    const registerResult = await this.extInfoService.registerImportedInformation(
      externalTitle.sourceUUID,
      externalTitle.id,
      newMovie.uuid,
      externalTitle,
    );

    if (registerResult.isFailure) {
      this.logger.error(
        `Failed to register imported information for movie ${newMovie.uuid}: ${registerResult.errorValue()}`,
      );
    }

    return newMovie;
  }

  private async createSeriesTitleFromExternalSource(externalTitle: TitleDetailedSearchResult) {
    const newSeriesTitle = new CreateSeriesTitleDTO();
    newSeriesTitle.type = TitleType.MOVIE;
    newSeriesTitle.names = [
      {
        type: NameCategory.Primary,
        value: externalTitle.title,
        language: '',
      },
    ];
    newSeriesTitle.releaseDate = new Date(externalTitle.releaseDate);

    const movieResult = await this.titlesService.createSeries(newSeriesTitle);

    if (movieResult.isFailure) {
      throw new BadRequestException(movieResult.errorValue());
    }

    const newSeries = movieResult.getValue();

    const registerResult = await this.extInfoService.registerImportedInformation(
      externalTitle.sourceUUID,
      externalTitle.id,
      newSeries.uuid,
      externalTitle,
    );

    if (registerResult.isFailure) {
      this.logger.error(
        `Failed to register imported information for series ${newSeries.uuid}: ${registerResult.errorValue()}`,
      );
    }

    return newSeries;
  }
}
