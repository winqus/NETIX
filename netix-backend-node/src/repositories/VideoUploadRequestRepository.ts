import { Model } from 'mongoose';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import VideoUploadRequest from '../core/entities/VideoUploadRequest';
import { Result } from '../core/logic/Result';
import VideoUploadRequestMapper from '../mappers/VideoUploadRequest.mapper';
import { IVideoUploadRequestPersistance } from '../persistence/schemas/videoUploadRequest.schema';
import IVideoUploadRequestRepository from '../services/IRepositories/IVideoUploadRequestRepository';

@Service()
export default class VideoUploadRequestRepository implements IVideoUploadRequestRepository {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('VideoUploadRequestSchema') private uploadRequestModel: Model<IVideoUploadRequestPersistance>
  ) {}

  public async create(request: VideoUploadRequest): Promise<Result<VideoUploadRequest>> {
    try {
      const requestPersistanceResult = VideoUploadRequestMapper.entityToPersistance(request);

      if (requestPersistanceResult.isFailure) {
        this.logger.error(`[VideoUploadRequestRepository]: Failed mapping request (${request.uuid}) ${requestPersistanceResult.error}`);

        return Result.fail<VideoUploadRequest>(requestPersistanceResult.error);
      }

      const newRequest = await this.uploadRequestModel.create(requestPersistanceResult.getValue());
      const savedRequest = await newRequest.save();

      return VideoUploadRequestMapper.persistanceToEntity(savedRequest);
    } catch (error) {
      this.logger.error(`[VideoUploadRequestRepository]: Request (${request.uuid}) creation failed: ${error}`);

      throw error;
    }
  }

  public async update(request: VideoUploadRequest): Promise<Result<VideoUploadRequest>> {
    try {
      const query = { uuid: request.uuid.toString() };

      const requestPersistanceResult = VideoUploadRequestMapper.entityToPersistance(request);

      if (requestPersistanceResult.isFailure) {
        this.logger.error(`[VideoUploadRequestRepository]: Failed mapping request (${request.uuid}) ${requestPersistanceResult.error}`);

        return Result.fail<VideoUploadRequest>(requestPersistanceResult.error);
      }

      const updateDocument = await this.uploadRequestModel.findOneAndUpdate(query, requestPersistanceResult.getValue());

      if (!updateDocument) {
        this.logger.error(`[VideoUploadRequestRepository]: Failed to find and update VideoUploadRequest with id ${request.uuid.toString()}`);

        return Result.fail<VideoUploadRequest>(`Failed to find and update VideoUploadRequest with id ${request.uuid.toString()}`);
      }

      return Result.ok(VideoUploadRequestMapper.persistanceToEntity(updateDocument).getValue());
    } catch (error) {
      this.logger.error(`[VideoUploadRequestRepository]: ${error}`);

      throw error;
    }
  }

  public async findByRequestId(requestId: string): Promise<Result<VideoUploadRequest | null>> {
    try {
      const query = { uuid: requestId };

      const request = await this.uploadRequestModel.findOne(query);

      if (!request) {
        return Result.fail(`No VideoUploadRequest found with id ${requestId}`);
      }

      return VideoUploadRequestMapper.persistanceToEntity(request);
    } catch (error) {
      this.logger.error(`[VideoUploadRequestRepository]: ${error}`);

      throw error;
    }
  }

  public async findByVideoId(videoId: string): Promise<Result<VideoUploadRequest | null>> {
    try {
      const query = { videoId };

      const request = await this.uploadRequestModel.findOne(query);

      if (!request) {
        return Result.fail(`No VideoUploadRequest found with videoId ${videoId}`);
      }

      return VideoUploadRequestMapper.persistanceToEntity(request);
    } catch (error) {
      this.logger.error(`[VideoUploadRequestRepository]: ${error}`);

      throw error;
    }
  }

  public async delete(requestId: string): Promise<Result<void>> {
    try {
      const query = { uuid: requestId };

      const deleteResult = await this.uploadRequestModel.deleteOne(query);

      if (deleteResult.deletedCount === 0) {
        this.logger.error(`[VideoUploadRequestRepository]: Failed to delete VideoUploadRequest with id ${requestId}`);

        return Result.fail(`Failed to delete VideoUploadRequest with id ${requestId}`);
      }

      return Result.ok();
    } catch (error) {
      this.logger.error(`[VideoUploadRequestRepository]: ${error}`);

      throw error;
    }
  }
}
