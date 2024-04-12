import { Service } from 'typedi';
import config from '../config/';
import { Result } from '../core/logic/Result';
import { VideoFileUploadContraintsDTO, VideoThumbnailUploadConstraintsDTO, VideoUploadConstraintsDTO } from '../dto/videoUploadDTOs';

@Service()
export default class VideoService {
  public async getVideoUploadConstraints(): Promise<Result<VideoUploadConstraintsDTO>> {
    try {
      const videoConstrains: VideoFileUploadContraintsDTO = {
        durationInSeconds: config.video.durationInSeconds,
        sizeInBytes: config.video.sizeInBytes,
        allowedMimeTypes: config.video.allowedMimeTypes,
        resolution: config.video.resolution,
      };

      const thumbnailConstraints: VideoThumbnailUploadConstraintsDTO = {
        maxSizeBytes: config.video.thumbnail.maxSizeBytes,
        allowedMimeTypes: config.video.thumbnail.allowedMimeTypes,
        resolution: config.video.thumbnail.resolution,
        aspectRatio: config.video.thumbnail.aspectRatio,
      };

      const constraintsResponse: VideoUploadConstraintsDTO = {
        videoFileConstraints: videoConstrains,
        thumbnailConstraints: thumbnailConstraints,
      };

      return Result.ok<VideoUploadConstraintsDTO>(constraintsResponse);
    } catch (error) {
      return Result.fail<VideoUploadConstraintsDTO>(error);
    }
  }
}
