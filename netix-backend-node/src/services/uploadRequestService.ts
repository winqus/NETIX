import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import UniqueEntityID from '../core/entities/UniqueEntityID';
import VideoUploadRequest from '../core/entities/VideoUploadRequest';
import { Result } from '../core/logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';
import { NewVideoUploadRequestDTO, VideoUploadRequestDTO } from '../dto/videoUploadDTOs';
import VideoUploadRequestMapper from '../mappers/VideoUploadRequest.mapper';
import VideoUploadRequestRepository from '../repositories/VideoUploadRequestRepository';

@Service()
export default class UploadRequestService {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject() private videoUploadRequestRepo: VideoUploadRequestRepository
  ) {}

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
      const newUploadRequestResult = VideoUploadRequest.create({
        videoId: new UniqueEntityID(),
        requesterId: new UniqueEntityID(newUploadRequestDTO.userId),
        videoState: VideoUploadState.Pending,
        thumbnailState: ThumbnailUploadState.Pending,
        metadataState: MetadataUploadState.Pending,
        overallState: VideoUploadRequestState.Initializing,
        chunksReceived: 0,
        totalChunks: 1,
      });

      if (newUploadRequestResult.isFailure) {
        this.logger.error(`[UploadRequestService]: Error creating videoUploadRequest by user  ${newUploadRequestResult.error}`);

        return Result.fail<VideoUploadRequestDTO>(newUploadRequestResult.error);
      }

      const newUploadRequest = newUploadRequestResult.getValue();

      const saveResult = await this.videoUploadRequestRepo.create(newUploadRequest);

      if (saveResult.isFailure) {
        this.logger.error(`[UploadRequestService]: Error saving videoUploadRequest by user ${saveResult.error}`);

        return Result.fail<VideoUploadRequestDTO>(saveResult.error);
      }

      const videoUploadRequest = VideoUploadRequestMapper.entityToDTO(saveResult.getValue());

      return Result.ok<VideoUploadRequestDTO>(videoUploadRequest);
    } catch (error) {
      this.logger.error(`[UploadRequestService]: ${error}`);

      throw error;
    }
  }
}
