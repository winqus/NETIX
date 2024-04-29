import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config from '../config';
import { Result } from '../core/logic/Result';
import { ThumbnailUploadConstraintsDTO, UploadConstraintsDTO, VideoFileUploadContraintsDTO } from '../dto/UploadConstraintsDTO';
import IUploadService from './IServices/IUploadService';

@Service()
export default class UploadService implements IUploadService {
  constructor(@Inject('logger') private logger: Logger) {}

  public async getUploadConstraints(): Promise<Result<UploadConstraintsDTO>> {
    try {
      const videoConstrains: VideoFileUploadContraintsDTO = {
        durationInSeconds: config.video.durationInSeconds,
        sizeInBytes: config.video.sizeInBytes,
        allowedMimeTypes: config.video.allowedMimeTypes,
        resolution: config.video.resolution,
      };

      const thumbnailConstraints: ThumbnailUploadConstraintsDTO = {
        maxSizeBytes: config.video.thumbnail.maxSizeBytes,
        allowedMimeTypes: config.video.thumbnail.allowedMimeTypes,
        resolution: config.video.thumbnail.resolution,
        aspectRatio: config.video.thumbnail.aspectRatio,
      };

      const constraintsResponse: UploadConstraintsDTO = {
        videoFileConstraints: videoConstrains,
        thumbnailConstraints: thumbnailConstraints,
      };

      return Result.ok<UploadConstraintsDTO>(constraintsResponse);
    } catch (error) {
      this.logger.error(`[UploadRequestService, getUploadConstraints]: ${error}`);

      throw error;
    }
  }
}
