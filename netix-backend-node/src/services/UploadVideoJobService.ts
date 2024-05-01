import Container, { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../config/dependencies';
import { Result } from '../core/logic/Result';
import { UploadState } from '../core/states/UploadState';
import { VideoState } from '../core/states/VideoState';
import FullUploadVideoJobDTO from '../dto/FullUploadVideoJobDTO';
import UploadVideoJobMapper from '../mappers/UploadVideoJobMapper';
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
        throw new Error(`Upload video job is not in PENDING or IN_PROGRESS state to upload chunks.`);
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

      if (job.chunksReceived === job.totalChunkCount) {
        await job.save();

        const service = Container.get(RawUploadFileService);
        const mergeResult = await service.mergeFileChunksIntoVideoFile(uploadID);

        if (mergeResult.isFailure) {
          this.logger.error(`[UploadVideoJobService, updateChunkUploadProgress]: ${mergeResult.errorValue()}`);

          throw new Error(mergeResult.errorValue() as string);
        }

        job.uploadFileDone = true;

        await VideoModel.updateOne({ _id: job.uploadID.videoID._id }, { state: VideoState.WAITING_FOR_PROCESSING }).exec();
      }

      await job.save();

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
}
