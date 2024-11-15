import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { Response } from 'express';
import internal from 'node:stream';
import { VideoState } from './entity/video.entity';
import { ApiDocsForGetVideoStream } from './swagger/api-docs.decorators';
import {
  VIDEO_FILE_CONTAINER,
  VIDEOS_ERROR_RANGE_HEADER_REQUIRED,
  VIDEOS_ERROR_REQUESTED_RANGE_NOT_SATISFIABLE,
  VIDEOS_ERROR_STREAM_NOT_FOUND,
  VIDEOS_SWAGGER_TAG,
} from './videos.constants';
import { VideosService } from './videos.service';

@ApiTags(VIDEOS_SWAGGER_TAG)
@Controller({
  path: 'videos/:id/stream',
  version: '1',
})
@UsePipes(new SimpleValidationPipe())
@SkipThrottle()
export class VideoStreamController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly videosSrv: VideosService,
    private readonly fileStorage: FileStorageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.PARTIAL_CONTENT)
  @ApiDocsForGetVideoStream()
  public async getVideoStream(@Param('id') id: string, @Res() res: Response) {
    try {
      const video = await this.videosSrv.findOne(id);
      if (video.state !== VideoState.READY) {
        this.logger.warn(`Video(${id}) is not ready for streaming`);
        throw new NotFoundException(VIDEOS_ERROR_STREAM_NOT_FOUND);
      }

      const videoFileLocation = { container: VIDEO_FILE_CONTAINER, fileName: id };

      let videoStat: any;
      try {
        videoStat = await this.fileStorage.getFileMetadata(videoFileLocation);
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.error('Failed to get video file metadata');
          throw new NotFoundException(VIDEOS_ERROR_STREAM_NOT_FOUND);
        } else {
          throw error;
        }
      }
      const fileSize = videoStat.size;
      if (fileSize == null || typeof fileSize !== 'number') {
        this.logger.error(`Failed to get file size for video(${id})`);
        throw new NotFoundException(VIDEOS_ERROR_STREAM_NOT_FOUND);
      }

      const range = res.req.headers.range;
      if (!range) {
        throw new BadRequestException(VIDEOS_ERROR_RANGE_HEADER_REQUIRED);
      }

      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      this.logger.verbose(`Streaming video(${id}) range ${start}-${end}`);

      if (start >= fileSize) {
        throw new HttpException(
          VIDEOS_ERROR_REQUESTED_RANGE_NOT_SATISFIABLE,
          HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
        );
      }

      let videoStream: internal.Readable;
      try {
        videoStream = await this.fileStorage.downloadStream({ ...videoFileLocation, options: { start, end } });
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.error('Failed to get video download stream');
          throw new NotFoundException(VIDEOS_ERROR_STREAM_NOT_FOUND);
        } else {
          throw error;
        }
      }
      const chunkSize = end - start + 1;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', video.mimeType);

      res.status(206);

      videoStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error while streaming video: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
