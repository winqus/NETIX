import { Controller, Get, HttpException, Logger, Param, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { VideoDTO } from './dto/video.dto';
import { VIDEOS_SWAGGER_TAG } from './videos.constants';
import { VideosService } from './videos.service';

@ApiTags(VIDEOS_SWAGGER_TAG)
@Controller({
  path: 'videos',
  version: '1',
})
@UsePipes(new SimpleValidationPipe())
export class VideosController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly videosSrv: VideosService) {}

  @Get(':id')
  // TODO: api docs
  // TODO: fix and add tests
  public async getVideo(@Param('id') id: string): Promise<VideoDTO> {
    try {
      const videoDTO = await this.videosSrv.findOne(id);

      return videoDTO;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
