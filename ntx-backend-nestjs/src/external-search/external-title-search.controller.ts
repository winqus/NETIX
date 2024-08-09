import { BadRequestException, Controller, Get, HttpException, Logger, Param, Query } from '@nestjs/common';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION, ExternalSearchSources } from './external-search.constants';
import { ExternalTitleSearchService } from './external-title-search.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
export class ExternalTitleSearchController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly extTitleSearchService: ExternalTitleSearchService) {}

  @Get('title')
  async searchTitle(
    @Query('q') query: string,
    @Query('type') type?: TitleType,
    @Query('maxResults') maxResults: number = 10,
  ) {
    try {
      const result = await this.extTitleSearchService.searchByQuery(query, type, maxResults);

      if (result.isFailure) {
        throw new BadRequestException(result.errorValue());
      }

      return result.getValue();
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

  @Get('title/:id')
  async searchDetails(
    @Param('id') id: string,
    @Query('type') type: TitleType,
    @Query('source') source = ExternalSearchSources.TMDB_SEARCH_V3,
  ) {
    try {
      const titleDetails = await this.extTitleSearchService.searchDetailsByTitleId(id, type, source);

      if (titleDetails.isFailure) {
        throw new BadRequestException(titleDetails.errorValue());
      }

      return titleDetails.getValue();
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
