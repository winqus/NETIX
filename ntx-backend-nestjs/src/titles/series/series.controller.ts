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
import { CreateMovieFromExternalSourceDTO } from '../movies/dto/CreateMovieFromExternalSource.dto';
import { CreateSeriesFromExternalSourceDTO } from './dto/CreateSeriesFromExternalSource.dto';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION } from './series.constants';
import { SeriesService } from './series.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SeriesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly seriesService: SeriesService,
    private readonly extTitleSearchService: ExternalTitleSearchService,
  ) {}

  @Post('/imported-from-external-source')
  public async createFromExternalSource(@Body() createFromExt: CreateSeriesFromExternalSourceDTO) {
    try {
      await validateOrReject(createFromExt);

      const externalDetailsResult = await this.extTitleSearchService.searchDetailsByTitleId(
        createFromExt.externalTitleID,
        TitleType.SERIES,
        createFromExt.externalSourceUUID as any,
      );

      if (externalDetailsResult.isFailure) {
        throw new BadRequestException(externalDetailsResult.errorValue());
      }

      const externalTitle = externalDetailsResult.getValue();

      const newSeriesResult = await this.seriesService.createFromExternalSource(externalTitle);
      if (newSeriesResult.isFailure) {
        throw new BadRequestException(newSeriesResult.errorValue());
      }
      const newSeries = newSeriesResult.getValue();

      this.logger.log(
        `Created new series ${newSeries.uuid} by importing ${externalTitle.id} from external source ` +
          `${externalTitle.sourceUUID}`,
      );

      return newSeries;
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
