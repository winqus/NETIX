import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';
import { Logger } from 'winston';
import config from '../config';
import { Result } from '../core/logic/Result';
import { UploadState } from '../core/states/UploadState';
import NewUploadPermissionRequestDTO from '../dto/NewUploadPermissionRequestDTO';
import { NewUploadPermissionResponseDTO } from '../dto/NewUploadPermissionResponseDTO';
import { ThumbnailUploadConstraintsDTO, UploadConstraintsDTO, VideoFileUploadContraintsDTO } from '../dto/UploadConstraintsDTO';
import MetadataModel from '../persistence/schemas/Metadata.model';
import ThumbnailModel from '../persistence/schemas/Thumbnail.model';
import UploadModel from '../persistence/schemas/Upload.model';
import UploadVideoJobModel from '../persistence/schemas/UploadVideoJob.model';
import VideoModel from '../persistence/schemas/Video.model';
import { inRange } from '../utils/mathUtils';
import { secureFileName } from '../utils/sanitization';
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

  public async getPermissionToUpload(uploadRequest: NewUploadPermissionRequestDTO): Promise<Result<NewUploadPermissionResponseDTO>> {
    try {
      const { userId, fileName, fileSizeInBytes, mimeType, durationInSeconds } = uploadRequest;

      if (!userId || !fileName || fileSizeInBytes === undefined || !mimeType || durationInSeconds === undefined) {
        throw new Error('Invalid upload request. Missing required arguments.');
      }

      this.logger.info(`[UploadRequestService, getPermissionToUpload]: User ${userId} requested to upload file ${fileName}, checking constraints`);

      const allowedDurationInSecRange = config.video.durationInSeconds;
      const allowedSizeInBytesRange = config.video.sizeInBytes;
      const allowedMimeTypes = config.video.allowedMimeTypes;

      if (inRange(uploadRequest.durationInSeconds, allowedDurationInSecRange.min, allowedDurationInSecRange.max) === false) {
        return Result.fail('Video duration out of range');
      }

      if (inRange(uploadRequest.fileSizeInBytes, allowedSizeInBytesRange.min, allowedSizeInBytesRange.max) === false) {
        return Result.fail('Video size out of range');
      }

      if (!allowedMimeTypes.includes(uploadRequest.mimeType)) {
        return Result.fail('Video mime type not allowed');
      }

      const userHasOtherUploadsInProgress = await UploadModel.exists({
        uploaderID: userId,
        state: { $in: [UploadState.PENDING, UploadState.IN_PROGRESS] },
      });

      if (userHasOtherUploadsInProgress) {
        this.logger.error(
          `[UploadRequestService, getPermissionToUpload]: User (${userId}) not allowed to upload because of other uploads in progress`
        );

        return Result.fail('User has other uploads in progress');
      }

      const singleChunkMaxSize = config.video.singleChunkMaxSizeInBytes;
      const totalChunkCount = Math.ceil(uploadRequest.fileSizeInBytes / singleChunkMaxSize);
      const securedFileName = secureFileName(fileName);

      const newVideo = await VideoModel.create({ _id: v4() });
      const newThumbnail = await ThumbnailModel.create({ _id: v4() });
      const newMetadata = await MetadataModel.create({ _id: v4() });
      const newUpload = await UploadModel.create({
        _id: v4(),
        uploaderID: userId,
        videoID: newVideo.id,
        metadataID: newMetadata.id,
        thumbnailID: newThumbnail.id,
      });

      const newUploadVideoJob = await UploadVideoJobModel.create({
        _id: v4(),
        uploadID: newUpload.id,
        chunks: Array.from({ length: totalChunkCount }, () => false),
        totalChunkCount: totalChunkCount,
        originalFileName: securedFileName,
        rawFileSizeInBytes: fileSizeInBytes,
      });

      const response: NewUploadPermissionResponseDTO = {
        uploadId: newUpload.id,
        uploadUrl: `http://localhost:3055/api/v1/upload/${newUpload.id}`,
        totalChunksCount: totalChunkCount,
        allowedUploadRateInChunksAtOnce: 1,
        chunkBaseName: newUploadVideoJob.id,
      };

      this.logger.info(`[UploadService, getPermissionToUpload]: ` + `Created upload (${newUpload.id}) for user ${newUpload.uploaderID}`);

      return Result.ok(response);
    } catch (error) {
      this.logger.error(`[UploadRequestService, getPermissionToUpload]: ${error}`);

      throw error;
    }
  }
}
