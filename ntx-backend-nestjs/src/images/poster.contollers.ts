import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Query,
  StreamableFile,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import {
  IMAGES_SWAGGER_TAG,
  POSTER_CONTROLLER_BASE_PATH,
  POSTER_CONTROLLER_VERSION,
  POSTER_EXTENTION,
  POSTER_MIME_TYPE,
  POSTER_NO_ID_PROVIDED_ERROR,
} from './images.constants';
import { PosterSize } from './images.types';
import { PosterService } from './poster.service';
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

  constructor(private readonly posterSrv: PosterService) {}

  @Get(':id')
  @ApiDocsForGetPoster()
  public async getFile(@Param('id') id: string, @Query('size') size?: PosterSize): Promise<StreamableFile> {
    try {
      if (id == null) {
        throw new BadRequestException(POSTER_NO_ID_PROVIDED_ERROR);
      }
      if (size == null) {
        size = PosterSize.M;
      }

      const fileName = makePosterFileName(id, size, POSTER_EXTENTION);
      const fileStream = await this.posterSrv.findOne(id, size);

      return new StreamableFile(fileStream, {
        type: POSTER_MIME_TYPE,
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
