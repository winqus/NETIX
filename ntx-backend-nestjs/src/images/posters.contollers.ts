import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  Logger,
  Param,
  ParseEnumPipe,
  Query,
  Res,
  StreamableFile,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { Response } from 'express';
import {
  IMAGES_SWAGGER_TAG,
  POSTER_CACHE_CONTROL_HEADER_VAL,
  POSTER_CONTROLLER_BASE_PATH,
  POSTER_CONTROLLER_VERSION,
  POSTER_EXTENTION,
  POSTER_MIME_TYPE,
  POSTER_NO_ID_PROVIDED_ERROR,
} from './images.constants';
import { PosterSize } from './images.types';
import { PostersService } from './posters.service';
import { ApiDocsForGetPoster } from './swagger/api-docs.decorators';
import { makePosterFileName } from './utils/images.utils';

@ApiTags(IMAGES_SWAGGER_TAG)
@Controller({
  path: POSTER_CONTROLLER_BASE_PATH,
  version: POSTER_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class PostersController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly postersSrv: PostersService) {}

  @Get(':id')
  @ApiDocsForGetPoster()
  public async getFile(
    @Param('id') id: string,
    @Query('size', new DefaultValuePipe(PosterSize.M), new ParseEnumPipe(PosterSize)) size: PosterSize,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      id = id.trim();
      if (!id) {
        throw new BadRequestException(POSTER_NO_ID_PROVIDED_ERROR);
      }

      const fileName = makePosterFileName(id, size, POSTER_EXTENTION);
      const fileStream = await this.postersSrv.findOne(id, size);

      res.setHeader('Cache-Control', POSTER_CACHE_CONTROL_HEADER_VAL);

      return new StreamableFile(fileStream, {
        type: POSTER_MIME_TYPE,
        disposition: `attachment; filename="${fileName}"`,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.error(`Failed to get poster (${id}): `, error.message);
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
