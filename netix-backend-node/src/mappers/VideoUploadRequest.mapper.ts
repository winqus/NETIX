import UniqueEntityID from '../core/entities/UniqueEntityID';
import VideoUploadRequest from '../core/entities/VideoUploadRequest';
import { Result } from '../core/logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';
import { VideoUploadRequestDTO } from '../dto/videoUploadDTOs';
import { IVideoUploadRequestPersistance } from '../persistence/schemas/videoUploadRequest.schema';

export default class VideoUploadRequestMapper {
  public static entityToPersistance(entity: VideoUploadRequest): Result<IVideoUploadRequestPersistance> {
    try {
      const persistance: IVideoUploadRequestPersistance = {
        uuid: entity.uuid.toString(),
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        videoId: entity.videoId.toString(),
        requesterId: entity.requesterId.toString(),
        videoState: entity.videoState,
        thumbnailState: entity.thumbnailState,
        thumbnailId: entity.thumbnailId?.toString(),
        metadataState: entity.metadataState,
        metadataId: entity.metadataId?.toString(),
        overallState: entity.overallState,
        chunksReceived: entity.chunksReceived,
        totalChunks: entity.totalChunks,
      };

      return Result.ok<IVideoUploadRequestPersistance>(persistance);
    } catch (error) {
      return Result.fail<IVideoUploadRequestPersistance>(error);
    }
  }

  public static persistanceToEntity(persistance: IVideoUploadRequestPersistance): Result<VideoUploadRequest> {
    const entityResult = VideoUploadRequest.create(
      {
        videoId: new UniqueEntityID(persistance.videoId),
        requesterId: new UniqueEntityID(persistance.requesterId),
        videoState: persistance.videoState as VideoUploadState,
        thumbnailId: persistance.thumbnailId ? new UniqueEntityID(persistance.thumbnailId) : undefined,
        thumbnailState: persistance.thumbnailState as ThumbnailUploadState,
        metadataState: persistance.metadataState as MetadataUploadState,
        metadataId: persistance.metadataId ? new UniqueEntityID(persistance.metadataId) : undefined,
        overallState: persistance.overallState as VideoUploadRequestState,
        chunksReceived: persistance.chunksReceived,
        totalChunks: persistance.totalChunks,
      },
      new UniqueEntityID(persistance.uuid)
    );

    return entityResult;
  }

  public static dtoToEntity(dto: VideoUploadRequestDTO): Result<VideoUploadRequest> {
    const entityResult = VideoUploadRequest.create(
      {
        videoId: new UniqueEntityID(dto.videoId),
        requesterId: new UniqueEntityID(dto.requesterId),
        videoState: dto.videoState as VideoUploadState,
        thumbnailId: dto.thumbnailId ? new UniqueEntityID(dto.thumbnailId) : undefined,
        thumbnailState: dto.thumbnailState as ThumbnailUploadState,
        metadataState: dto.metadataState as MetadataUploadState,
        metadataId: dto.metadataId ? new UniqueEntityID(dto.metadataId) : undefined,
        overallState: dto.overallState as VideoUploadRequestState,
        chunksReceived: dto.chunksReceived,
        totalChunks: dto.totalChunks,
      },
      new UniqueEntityID(dto.requestId)
    );

    return entityResult;
  }

  public static entityToDTO(entity: VideoUploadRequest): VideoUploadRequestDTO {
    return {
      requestId: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      videoId: entity.videoId.toString(),
      requesterId: entity.requesterId.toString(),
      videoState: entity.videoState,
      thumbnailId: entity.thumbnailId?.toString(),
      thumbnailState: entity.thumbnailState,
      metadataId: entity.metadataId?.toString(),
      metadataState: entity.metadataState,
      overallState: entity.overallState,
      chunksReceived: entity.chunksReceived,
      totalChunks: entity.totalChunks,
    };
  }
}
