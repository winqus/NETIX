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
import { videoFileStorageOptions } from './options/videoFileStorageOptions';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION, UPLOAD_THROTTLE_OPTIONS, VIDEO_FILE } from './videos.constants';
import { VideosService } from './videos.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
export class VideosController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly videoService: VideosService) {}

  @Throttle({ default: UPLOAD_THROTTLE_OPTIONS })
  @Post('title/:id')
  @UseInterceptors(FileInterceptor(VIDEO_FILE.FIELD_NAME, videoFileStorageOptions))
  async uploadThumbnailFile(@Param('id') titleID: string, @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.videoService.processVideoForTitle(titleID, file);
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
