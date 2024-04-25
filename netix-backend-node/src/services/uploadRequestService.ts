import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Result } from '../core/logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';
import { NewVideoUploadRequestDTO, VideoUploadRequestDTO } from '../dto/videoUploadDTOs';

@Service()
export default class UploadRequestService {
  constructor(@Inject('logger') private logger: Logger) {}

  public async getVideoUploadRequest(_requestId: string): Promise<Result<VideoUploadRequestDTO>> {
    try {
      const videoUploadRequest: VideoUploadRequestDTO = {
        requestId: 'temp-request-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        videoId: 'temp-video-id-123',
        requesterId: 'temp-requester-id-123',
        videoState: VideoUploadState.Uploading,
        thumbnailState: ThumbnailUploadState.Pending,
        metadataState: MetadataUploadState.Pending,
        overallState: VideoUploadRequestState.Initializing,
        chunksReceived: 0,
        totalChunks: 1,
      };

      return Result.ok<VideoUploadRequestDTO>(videoUploadRequest);
    } catch (error) {
      this.logger.error(`[UploadRequestService]: ${error}`);

      throw error;
    }
  }

  public async createVideoUploadRequest(newUploadRequestDTO: NewVideoUploadRequestDTO): Promise<Result<VideoUploadRequestDTO>> {
    try {
      const videoUploadRequest: VideoUploadRequestDTO = {
        requestId: 'temp-request-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        videoId: 'temp-video-id-123',
        requesterId: newUploadRequestDTO.userId,
        videoState: VideoUploadState.Uploading,
        thumbnailState: ThumbnailUploadState.Pending,
        metadataState: MetadataUploadState.Pending,
        overallState: VideoUploadRequestState.Initializing,
        chunksReceived: 0,
        totalChunks: 1,
      };

      return Result.ok<VideoUploadRequestDTO>(videoUploadRequest);
    } catch (error) {
      this.logger.error(`[UploadRequestService]: ${error}`);

      throw error;
    }
  }
}
