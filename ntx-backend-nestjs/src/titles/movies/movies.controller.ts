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
import { validateOrReject } from 'class-validator';
import { CreateMovieFromExternalSourceDTO } from './dto/CreateMovieFromExternalSource.dto';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION } from './movies.constants';
import { MoviesService } from './movies.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MoviesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesService: MoviesService,
    private readonly extTitleSearchService: ExternalTitleSearchService,
  ) {}

  @Post('/imported-from-external-source')
  public async createFromExternalSource(@Body() createFromExt: CreateMovieFromExternalSourceDTO) {
    try {
      await validateOrReject(createFromExt);

      const externalDetailsResult = await this.extTitleSearchService.searchDetailsByTitleId(
        createFromExt.externalTitleID,
        TitleType.MOVIE,
        createFromExt.externalSourceUUID as any,
      );

      if (externalDetailsResult.isFailure) {
        throw new BadRequestException(externalDetailsResult.errorValue());
      }

      const externalTitle = externalDetailsResult.getValue();

      const newMovie = this.moviesService.createFromExternalSource(externalTitle);

      return newMovie;
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
}
