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
import { ExternalTitleSearchService } from '@ntx/external-search/external-title-search.service';
import { CreateTitleFromExternalSourceDTO } from './dto/CreateTitleFromExternalSource.dto';
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
  ) {}

  // TODO: implement createTitle method
  @Post()
  async createTitleFromExternalSource(@Body() createTitleFromExt: CreateTitleFromExternalSourceDTO) {
    try {
      const externalDetailsResult = await this.extTitleSearchService.searchDetailsByTitleId(
        createTitleFromExt.externalTitleID,
        createTitleFromExt.type,
        createTitleFromExt.externalSourceUUID as any,
      );

      if (externalDetailsResult.isFailure) {
        throw new BadRequestException(externalDetailsResult.errorValue());
      }

      throw new BadRequestException('Not implemented');

      // TODO: implementation
      // const titleResult = await this.titlesService.createTitleFromExternalSource(externalDetails.getValue());

      // if (titleResult.isFailure) {
      //   throw new BadRequestException(titleResult.errorValue());
      // }

      // return titleResult.getValue();
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
