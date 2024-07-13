import {
  BadRequestException,
  Controller,
  HttpException,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Throttle } from '@nestjs/throttler';
import { CustomHttpInternalErrorException } from '../common/exceptions/HttpInternalError.exception';
import { thumbnailFileStorageOptions } from './options/thumbnailFileStorageOptions';
import {
  CONTROLLER_BASE_PATH,
  CONTROLLER_VERSION,
  THUMBNAIL_FILE,
  UPLOAD_THROTTLE_OPTIONS,
} from './thumbnails.constants';
import { ThumbnailsService } from './thumbnails.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
export class ThumbnailsController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly thumbnailService: ThumbnailsService) {}

  @Throttle({ default: UPLOAD_THROTTLE_OPTIONS })
  @Post('title/:id')
  @UseInterceptors(FileInterceptor(THUMBNAIL_FILE.FIELD_NAME, thumbnailFileStorageOptions))
  async uploadThumbnailFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.thumbnailService.processThumbnailForTitle(id, file);
      if (result.isFailure) {
        throw new BadRequestException(result.errorValue());
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
}
