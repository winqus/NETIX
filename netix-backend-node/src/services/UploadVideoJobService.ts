import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Result } from '../core/logic/Result';
import { UploadState } from '../core/states/UploadState';
import FullUploadVideoJobDTO from '../dto/FullUploadVideoJobDTO';
import UploadVideoJobMapper from '../mappers/UploadVideoJobMapper';
import UploadVideoJobModel, { IFullUploadVideoJobPersistance } from '../persistence/schemas/UploadVideoJob.model';
import IUploadVideoJobService from './IServices/IUploadVideoJobService';

@Service()
export default class UploadVideoJobService implements IUploadVideoJobService {
  constructor(@Inject('logger') private logger: Logger) {}

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

      return job as IFullUploadVideoJobPersistance;
    } catch (error) {
      throw error;
    }
  }
}
