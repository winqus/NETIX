import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Throttle } from '@nestjs/throttler';
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
  constructor(private readonly thumbnailService: ThumbnailsService) {}

  @Throttle({ default: UPLOAD_THROTTLE_OPTIONS })
  @Post('title/:id')
  @UseInterceptors(FileInterceptor(THUMBNAIL_FILE.FIELD_NAME, thumbnailFileStorageOptions))
  async uploadThumbnailFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    this.thumbnailService.processThumbnailForTitle(id, file);
  }
}
