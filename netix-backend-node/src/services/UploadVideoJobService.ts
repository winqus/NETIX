import Container, { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../config/dependencies';
import { Result } from '../core/logic/Result';
import { MetadataState } from '../core/states/MetadataState';
import { ThumbnailState } from '../core/states/ThumbnailState';
import { UploadState } from '../core/states/UploadState';
import { VideoState } from '../core/states/VideoState';
import FullUploadVideoJobDTO from '../dto/FullUploadVideoJobDTO';
import MetadataDTO from '../dto/MetadataDTO';
import { UploadMetadataRequestDTO } from '../dto/UploadMetadataDTO';
import UploadVideoJobMapper from '../mappers/UploadVideoJobMapper';
import ThumbnailModel from '../persistence/schemas/Thumbnail.model';
import UploadModel from '../persistence/schemas/Upload.model';
import UploadVideoJobModel, { IFullUploadVideoJobPersistanceDocument } from '../persistence/schemas/UploadVideoJob.model';
import VideoModel from '../persistence/schemas/Video.model';
import IUploadVideoJobService from './IServices/IUploadVideoJobService';
import RawUploadFileService from './RawUploadFileService';

@Service()
export default class UploadVideoJobService implements IUploadVideoJobService {
  constructor(@Inject(NAMES.Logger) private logger: Logger) {}

  public async getFullByUploadID(uploadID: string): Promise<Result<FullUploadVideoJobDTO>> {
    try {
      const job = await this.getPopulatedJob(uploadID);

      const dto = UploadVideoJobMapper.fullPersistanceToDTO(job);

      return Result.ok(dto);
    } catch (error) {
      this.logger.error(
        `[UploadVideoJobService, getFullByUploadID]: ` +
          `Error while trying to get full upload video job by upload ID (${uploadID}): ${JSON.stringify(error)}`
      );

      return Result.fail(`Failed to get full upload video job by upload ID.`);
    }
  }

  public async getPendingOrInProgressForUserByUploadID(userID: string, uploadID: string): Promise<Result<FullUploadVideoJobDTO>> {
    try {
      const job = await this.getPopulatedJob(uploadID);

      if (job.uploadID.uploaderID !== userID) {
        this.logger.error(
          `[UploadVideoJobService, getPendingOrInProgressForUserByUploadID]: ` +
            `Upload video job does not belong to user: ${userID} for upload ID: ${uploadID}`
        );

        return Result.fail(`Upload video job does not belong to user.`);
      }

      if (job.uploadID.state !== UploadState.PENDING && job.uploadID.state !== UploadState.IN_PROGRESS) {
        this.logger.error(
          `[UploadVideoJobService, getPendingOrInProgressForUserByUploadID]: ` +
            `Upload video job is not in PENDING or IN_PROGRESS state for upload ID: ${uploadID}`
        );

        return Result.fail(`Upload video job is not in PENDING or IN_PROGRESS state.`);
      }

      const dto = UploadVideoJobMapper.fullPersistanceToDTO(job);

      return Result.ok(dto);
    } catch (error) {
      this.logger.error(
        `[UploadVideoJobService, getPendingOrInProgressForUserByUploadID]: ` +
          `Error while trying to get full upload video job by upload ID (${uploadID}): ${JSON.stringify(error)}`
      );

      return Result.fail(`Failed to get full upload video job by upload ID.`);
    }
  }

  public async updateChunkUploadProgress(uploadID: string, chunkIndex: number): Promise<Result<void>> {
    const job = await this.getPopulatedJob(uploadID);
    try {
      if (!job) {
        throw new Error(`Upload video job not found for upload ID: ${uploadID}`);
      }

      if (![UploadState.PENDING, UploadState.IN_PROGRESS].includes(job.uploadID.state)) {
        this.logger.error(
          `[UploadVideoJobService, updateChunkUploadProgress]: Upload job is not in correct state (${job.uploadID.state}) to upload chunks.`
        );

        return Result.fail(`Upload job is not in correct state to upload chunks.`);
      }

      if (![VideoState.PENDING, VideoState.PENDING, VideoState.UPLOADING].includes(job.uploadID.videoID.state)) {
        this.logger.error(
          `[UploadVideoJobService, updateChunkUploadProgress]: Video is not in correct state (${job.uploadID.videoID.state}) to upload chunks.`
        );

        return Result.fail(`Video is not in correct state to upload chunks.`);
      }

      if (job.chunks[chunkIndex]) {
        this.logger.error(
          `[UploadVideoJobService, updateChunkUploadProgress]: ` + `Chunk (${chunkIndex}) already received for upload ID (${uploadID}).`
        );

        return Result.fail(`Chunk already received for upload ID.`);
      }

      if (job.chunksReceived === 0) {
        await UploadModel.updateOne({ _id: job.uploadID._id }, { state: UploadState.IN_PROGRESS }).exec();
        await VideoModel.updateOne({ _id: job.uploadID.videoID._id }, { state: VideoState.UPLOADING }).exec();
      }

      job.chunks[chunkIndex] = true;
      job.chunksReceived += 1;
      job.uploadFileProgressPercentage = Math.round((job.chunksReceived / job.totalChunkCount) * 100);
      await job.save();

      // TODO - move merge operation to separate service (worker queue)
      if (job.chunksReceived === job.totalChunkCount) {
        setTimeout(async () => {
          try {
            const service = Container.get(RawUploadFileService);
            const mergeResult = await service.mergeFileChunksIntoVideoFile(uploadID);

            if (mergeResult.isFailure) {
              this.logger.error(`[UploadVideoJobService, updateChunkUploadProgress]: ${mergeResult.errorValue()}`);
              throw new Error(mergeResult.errorValue() as string);
            }

            await UploadVideoJobModel.updateOne({ _id: job._id }, { uploadFileDone: true });
            await VideoModel.updateOne({ _id: job.uploadID.videoID._id }, { state: VideoState.WAITING_FOR_PROCESSING }).exec();

            this.logger.info(`Merged video chunks into single file with extention for upload ID (${uploadID})`);
          } catch (error) {
            this.logger.error(`Error during merging process: ${JSON.stringify((error as any).message)}`);
          }
        }, 3000);
      }
      // --- Merge operation done ---

      this.checkJobCompletedAndUpdate(uploadID);

      this.logger.debug(`Updated chunk (${chunkIndex}) upload progress for upload ID (${uploadID}), chunks received: ${job.chunksReceived}`);

      return Result.ok();
    } catch (error) {
      await UploadModel.updateOne({ _id: job.uploadID._id }, { state: UploadState.FAILED }).exec();
      await VideoModel.updateOne({ _id: job.uploadID.videoID._id }, { state: VideoState.FAILED }).exec();

      this.logger.error(
        `[UploadVideoJobService, updateChunkUploadProgress]: ` +
          `Error while trying to update chunk upload progress for upload ID (${uploadID}): ${JSON.stringify(error)}`
      );

      return Result.fail(`Failed to update chunk upload progress for upload ID.`);
    }
  }

  public async uploadMetadata(uploadID: string, request: UploadMetadataRequestDTO): Promise<Result<MetadataDTO>> {
    try {
      const { title, publishDatetime } = request.metadata;

      if (title == null || publishDatetime == null) {
        this.logger.error(`[UploadVideoJobService, uploadMetadata]: Metadata is missing required fields.`);

        return Result.fail(`Metadata is missing required fields.`);
      }

      const job = await this.getPopulatedJob(uploadID);

      if (!job) {
        return Result.fail(`Upload video job not found for upload ID: ${uploadID}`);
      }

      if (![UploadState.PENDING, UploadState.IN_PROGRESS].includes(job.uploadID.state)) {
        this.logger.error(`[UploadVideoJobService, uploadMetadata]: Upload job is not in correct state to upload metadata (${job.uploadID.state}).`);

        return Result.fail(`Upload job is not in correct state to upload metadata.`);
      }

      if (![job.uploadID.metadataID.state].includes(MetadataState.PENDING)) {
        this.logger.error(
          `[UploadVideoJobService, uploadMetadata]: Metadata is not in correct state to upload metadata (${job.uploadID.metadataID.state}).`
        );

        return Result.fail(`Metadata is not in correct state to upload metadata.`);
      }

      if (job.uploadID.state !== UploadState.IN_PROGRESS) {
        await UploadModel.updateOne({ _id: job.uploadID._id }, { state: UploadState.IN_PROGRESS }).exec();
      }

      job.uploadID.metadataID.title = title;
      job.uploadID.metadataID.publishDatetime = publishDatetime;
      job.uploadID.metadataID.state = MetadataState.READY;
      job.uploadID.metadataID.ready = true;
      const updatedMetadata = await job.uploadID.metadataID.save();

      this.checkJobCompletedAndUpdate(uploadID);

      this.logger.info(`Uploaded metadata for upload ID (${uploadID})`);

      return Result.ok({
        uuid: updatedMetadata.id,
        createdAt: updatedMetadata.createdAt,
        updatedAt: updatedMetadata.updatedAt,
        title: updatedMetadata.title,
        publishDatetime: updatedMetadata.publishDatetime,
        ready: updatedMetadata.ready,
        state: updatedMetadata.state,
      });
    } catch (error) {
      this.logger.error(`[UploadVideoJobService, uploadMetadata]: ` + `Error while trying to upload metadata for upload ID (${uploadID}): ${error}`);

      throw new Error(`Failed to upload metadata for upload ID. Check logs.`);
    }
  }

  public async updateThumbnailUploadProgress(uploadID: string): Promise<Result<void>> {
    try {
      const job = await this.getPopulatedJob(uploadID);

      if (!job) {
        return Result.fail(`Upload video job not found for upload ID: ${uploadID}`);
      }

      if (![UploadState.PENDING, UploadState.IN_PROGRESS].includes(job.uploadID.state)) {
        this.logger.error(
          `[UploadVideoJobService, updateThumbnailUploadProgress]: ` +
            `Upload job is not in correct state to upload thumbnail (${job.uploadID.state}).`
        );

        return Result.fail(`Upload job is not in correct state to upload thumbnail.`);
      }

      if (![ThumbnailState.PENDING, ThumbnailState.UPLOADING].includes(job.uploadID.thumbnailID.state)) {
        this.logger.error(
          `[UploadVideoJobService, updateThumbnailUploadProgress]: ` +
            `Thumbnail is not in correct state to upload thumbnail (${job.uploadID.thumbnailID.state}).`
        );

        return Result.fail(`Thumbnail is not in correct state to upload thumbnail.`);
      }

      if (job.uploadID.state !== UploadState.IN_PROGRESS) {
        await UploadModel.updateOne({ _id: job.uploadID._id }, { state: UploadState.IN_PROGRESS }).exec();
      }

      job.uploadID.thumbnailID.state = ThumbnailState.WAITING_FOR_PROCESSING;
      await job.uploadID.thumbnailID.save();

      // TODO - move thumbnail processing to separate service (worker queue?)
      setTimeout(async () => {
        try {
          await ThumbnailModel.updateOne({ _id: job.uploadID.thumbnailID._id }, { state: ThumbnailState.PROCESSING }).exec();

          const rawUploadService = Container.get(RawUploadFileService);

          const thumbnailResult = await rawUploadService.checkAndMoveThumbnailFile(uploadID);

          if (thumbnailResult.isFailure) {
            this.logger.error(`[UploadVideoJobService, updateThumbnailUploadProgress]: ${thumbnailResult.errorValue()}`);
            job.uploadID.thumbnailID.state = ThumbnailState.FAILED;
            await job.uploadID.thumbnailID.save();

            throw new Error(`Failed to upload thumbnail for upload ID (${uploadID}).`);
          }

          await ThumbnailModel.updateOne(
            { _id: job.uploadID.thumbnailID._id },
            {
              mimeType: thumbnailResult.getValue().fileMimeType,
              state: ThumbnailState.READY,
              ready: true,
            }
          ).exec();

          await this.checkJobCompletedAndUpdate(uploadID);

          this.logger.info(`Processed thumbnail for upload ID (${uploadID})`);
        } catch (error) {
          this.logger.error(`Error during merging process: ${JSON.stringify((error as any).message)}`);
        }
      }, 3000);
      // --- Thumbnail processing done ---

      this.logger.info(`Uploaded thumbnail for upload ID (${uploadID})`);

      return Result.ok();
    } catch (error) {
      this.logger.error(
        `[UploadVideoJobService, updateThumbnailUploadProgress]: ` +
          `Error while trying to upload thumbnail for upload ID (${uploadID}): ${JSON.stringify(error)}`
      );

      return Result.fail(`Failed to upload thumbnail for upload ID.`);
    }
  }

  private async getPopulatedJob(uploadID: string) {
    try {
      const job = await UploadVideoJobModel.findOne({ uploadID })
        .populate('uploadID')
        .populate({
          path: 'uploadID',
          populate: [
            { path: 'videoID', model: 'Video' },
            { path: 'metadataID', model: 'Metadata' },
            { path: 'thumbnailID', model: 'Thumbnail' },
          ],
        })
        .exec();

      if (!job) {
        this.logger.error(
          `[UploadVideoJobService, getFullByUploadID]: Upload video job not found for upload ID: ${uploadID}: ${JSON.stringify(job)}`
        );
        throw new Error(`Upload video job not found (or failed to populate) for upload ID: ${uploadID}`);
      }

      return job as IFullUploadVideoJobPersistanceDocument;
    } catch (error) {
      throw error;
    }
  }

  private async checkJobCompletedAndUpdate(uploadID: string) {
    const job = await this.getPopulatedJob(uploadID);
    if (
      job.uploadID.state === UploadState.IN_PROGRESS &&
      job.uploadID.metadataID.ready &&
      job.uploadID.thumbnailID.ready &&
      job.uploadID.videoID.ready
    ) {
      job.uploadID.state = UploadState.COMPLETED;
      await job.uploadID.save();
    }
  }
}
