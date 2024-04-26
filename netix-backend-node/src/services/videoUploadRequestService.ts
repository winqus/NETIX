import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config from '../config';
import UniqueEntityID from '../core/entities/UniqueEntityID';
import VideoUploadRequest from '../core/entities/VideoUploadRequest';
import { Result } from '../core/logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';
import { NewVideoUploadRequestDTO, VideoUploadRequestDTO } from '../dto/videoUploadDTOs';
import VideoUploadRequestMapper from '../mappers/VideoUploadRequest.mapper';
import { inRange } from '../utils/mathUtils';
import IVideoUploadRequestRepository from './IRepositories/IVideoUploadRequestRepository';
import IVideoUploadRequestService from './IServices/IVideoUploadRequestService';

@Service()
export default class VideoUploadRequestService implements IVideoUploadRequestService {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('VideoUploadRequestRepository') private videoUploadRequestRepo: IVideoUploadRequestRepository
  ) {}

  public async getVideoUploadRequest(requestId: string): Promise<Result<VideoUploadRequestDTO>> {
    try {
      const videoUploadRequestResult = await this.videoUploadRequestRepo.findByRequestId(requestId);

      if (videoUploadRequestResult.isFailure) {
        this.logger.error(`[UploadRequestService, getVideoUploadRequest]: Error finding videoUploadRequest by request id ${requestId}`);

        return Result.fail(videoUploadRequestResult.error);
      }

      const videoUploadRequest = videoUploadRequestResult.getValue();

      if (!videoUploadRequest) {
        this.logger.error(`[UploadRequestService, getVideoUploadRequest]: No videoUploadRequest found by request id ${requestId}`);

        return Result.fail(`No videoUploadRequest found by request id ${requestId}`);
      }

      const videoUploadRequestDTO = VideoUploadRequestMapper.entityToDTO(videoUploadRequest);

      this.logger.info(
        `[UploadRequestService, getVideoUploadRequest]: ` +
          `Found videoUploadRequest (${videoUploadRequestDTO.requestId}) for user ${videoUploadRequestDTO.requesterId}`
      );

      return Result.ok(videoUploadRequestDTO);
    } catch (error) {
      this.logger.error(`[UploadRequestService, getVideoUploadRequest]: ${error}`);

      throw error;
    }
  }

  public async createVideoUploadRequest(newUploadRequestDTO: NewVideoUploadRequestDTO): Promise<Result<VideoUploadRequestDTO>> {
    try {
      const allowedDurationInSecRange = config.video.durationInSeconds;
      const allowedSizeInBytesRange = config.video.sizeInBytes;
      const allowedMimeTypes = config.video.allowedMimeTypes;

      if (inRange(newUploadRequestDTO.durationInSeconds, allowedDurationInSecRange.min, allowedDurationInSecRange.max) === false) {
        this.logger.error(
          `[UploadRequestService, createVideoUploadRequest]: ` +
            `Video duration (${newUploadRequestDTO.durationInSeconds}) out of range for user ${newUploadRequestDTO.userId}`
        );

        return Result.fail('Video duration out of range');
      }

      if (inRange(newUploadRequestDTO.fileSizeInBytes, allowedSizeInBytesRange.min, allowedSizeInBytesRange.max) === false) {
        this.logger.error(
          `[UploadRequestService, createVideoUploadRequest]: ` +
            `Video size (${newUploadRequestDTO.fileSizeInBytes}) out of range for user ${newUploadRequestDTO.userId}`
        );

        return Result.fail('Video size out of range');
      }

      if (!allowedMimeTypes.includes(newUploadRequestDTO.mimeType)) {
        this.logger.error(
          `[UploadRequestService, createVideoUploadRequest]: ` +
            `Video mime type (${newUploadRequestDTO.mimeType}) not allowed for user ${newUploadRequestDTO.userId}`
        );

        return Result.fail('Video mime type not allowed');
      }

      const singleChunkMaxSize = config.video.singleChunkMaxSizeInBytes;
      const totalChunkCount = Math.ceil(newUploadRequestDTO.fileSizeInBytes / singleChunkMaxSize);

      const newUploadRequestResult = VideoUploadRequest.create({
        videoId: new UniqueEntityID(),
        requesterId: new UniqueEntityID(newUploadRequestDTO.userId),
        videoState: VideoUploadState.Pending,
        thumbnailState: ThumbnailUploadState.Pending,
        metadataState: MetadataUploadState.Pending,
        overallState: VideoUploadRequestState.Pending,
        chunksReceived: 0,
        totalChunks: totalChunkCount,
      });

      if (newUploadRequestResult.isFailure) {
        this.logger.error(
          `[UploadRequestService, createVideoUploadRequest]: ` +
            `Error creating videoUploadRequest for user (${newUploadRequestDTO.userId}), ${newUploadRequestResult.error}`
        );

        return Result.fail(newUploadRequestResult.error);
      }

      const newUploadRequest = newUploadRequestResult.getValue();

      const saveResult = await this.videoUploadRequestRepo.create(newUploadRequest);

      if (saveResult.isFailure) {
        this.logger.error(`[UploadRequestService, createVideoUploadRequest]: Error saving videoUploadRequest by user ${saveResult.error}`);

        return Result.fail(saveResult.error);
      }

      const videoUploadRequest = VideoUploadRequestMapper.entityToDTO(saveResult.getValue());

      this.logger.info(
        `[UploadRequestService, createVideoUploadRequest]: ` +
          `Created videoUploadRequest (${videoUploadRequest.requestId}) for user ${videoUploadRequest.requesterId}`
      );

      return Result.ok(videoUploadRequest);
    } catch (error) {
      this.logger.error(`[UploadRequestService, createVideoUploadRequest]: ${error}`);

      throw error;
    }
  }

  public async incrementUploadProgress(requestId: string, chunkIndex: number): Promise<Result<VideoUploadRequestDTO>> {
    try {
      this.logger.info(
        `[UploadRequestService, incrementUploadProgress]: Incrementing upload progress for request id ${requestId}, chunk index ${chunkIndex}`
      );

      const videoUploadRequestResult = await this.videoUploadRequestRepo.findByRequestId(requestId);

      if (videoUploadRequestResult.isFailure) {
        this.logger.error(`[UploadRequestService, incrementUploadProgress]: Error finding videoUploadRequest by request id ${requestId}`);

        return Result.fail(videoUploadRequestResult.error);
      }

      const uploadReq = videoUploadRequestResult.getValue();

      if (!uploadReq) {
        this.logger.error(`[UploadRequestService, incrementUploadProgress]: No videoUploadRequest found by request id ${requestId}`);

        return Result.fail(`No videoUploadRequest found by request id ${requestId}`);
      }

      if (uploadReq.chunksReceived >= uploadReq.totalChunks) {
        this.logger.error(`[UploadRequestService, incrementUploadProgress]: All chunks already received for request id ${requestId}`);

        return Result.fail('All chunks already received');
      }

      uploadReq.chunksReceived += 1;

      if (uploadReq.chunksReceived === 1) {
        uploadReq.videoState = VideoUploadState.Uploading;
        uploadReq.overallState = VideoUploadRequestState.Uploading;
      } else if (uploadReq.chunksReceived === uploadReq.totalChunks) {
        uploadReq.videoState = VideoUploadState.Completed;

        if (
          uploadReq.metadataState === MetadataUploadState.Completed &&
          uploadReq.thumbnailState === ThumbnailUploadState.Completed &&
          uploadReq.videoState === VideoUploadState.Completed
        ) {
          uploadReq.overallState = VideoUploadRequestState.Processing;
          // TODO: Add event to trigger video processing
        }
      }

      const updateResult = await this.videoUploadRequestRepo.update(uploadReq);

      if (updateResult.isFailure) {
        this.logger.error(`[UploadRequestService, incrementUploadProgress]: Error updating videoUploadRequest by request id ${requestId}`);

        return Result.fail(updateResult.error);
      }

      this.logger.info(
        `[UploadRequestService, incrementUploadProgress]: Updated upload progress for request id ${requestId}, chunk index ${chunkIndex}`
      );

      return Result.ok(VideoUploadRequestMapper.entityToDTO(updateResult.getValue()));
    } catch (error) {
      this.logger.error(`[UploadRequestService, incrementUploadProgress]: ${error}`);

      throw error;
    }
  }
}
