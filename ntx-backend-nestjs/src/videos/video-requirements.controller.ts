import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideoFileRequirementsDTO } from './dto/video-file-requirements.dto';
import {
  VIDEOS_FILE_ALLOWED_EXTENTIONS,
  VIDEOS_FILE_ALLOWED_MIME_TYPES,
  VIDEOS_FILE_MAX_SIZE_IN_BYTES,
  VIDEOS_SWAGGER_TAG,
} from './videos.constants';

@ApiTags(VIDEOS_SWAGGER_TAG)
@Controller({
  path: 'video-requirements',
  version: '1',
})
export class VideoRequirementsController {
  @Get('file')
  public async getFileRequirements(): Promise<VideoFileRequirementsDTO> {
    return {
      supportedMimeTypes: VIDEOS_FILE_ALLOWED_MIME_TYPES,
      allowedExtentions: VIDEOS_FILE_ALLOWED_EXTENTIONS,
      maxFileSizeInBytes: VIDEOS_FILE_MAX_SIZE_IN_BYTES,
    };
  }
}
