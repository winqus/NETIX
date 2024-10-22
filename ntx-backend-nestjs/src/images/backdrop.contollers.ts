import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Res,
  StreamableFile,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { Response } from 'express';
import { BackDropService } from './backdrop.service';
import {
  BACKDROP_CACHE_CONTROL_HEADER_VAL,
  BACKDROP_CONTROLLER_BASE_PATH,
  BACKDROP_CONTROLLER_VERSION,
  BACKDROP_EXTENTION,
  BACKDROP_MIME_TYPE,
  BACKDROP_NO_ID_PROVIDED_ERROR,
  IMAGES_SWAGGER_TAG,
} from './images.constants';
import { BackdropSize } from './images.types';
import { ApiDocsForGetBackdrop } from './swagger/api-docs.decorators';
import { makeBackdropFileName } from './utils/images.utils';

@ApiTags(IMAGES_SWAGGER_TAG)
@Controller({
  path: BACKDROP_CONTROLLER_BASE_PATH,
  version: BACKDROP_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class BackdropsController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly backdropSrv: BackDropService) {}

  @Get(':id')
  @ApiDocsForGetBackdrop()
  public async getFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    try {
      if (id == null) {
        throw new BadRequestException(BACKDROP_NO_ID_PROVIDED_ERROR);
      }

      const size = BackdropSize.L;

      const fileName = makeBackdropFileName(id, size, BACKDROP_EXTENTION);
      const fileStream = await this.backdropSrv.findOne(id, size);

      res.setHeader('Cache-Control', BACKDROP_CACHE_CONTROL_HEADER_VAL);

      return new StreamableFile(fileStream, {
        type: BACKDROP_MIME_TYPE,
        disposition: `attachment; filename="${fileName}"`,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
