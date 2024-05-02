import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../config/dependencies';
import UploadVideoJobModel, { IFullUploadVideoJobPersistanceDocument } from '../persistence/schemas/UploadVideoJob.model';

export interface IUploadVideoJobRepository {
  getPopulatedJob(uploadJobID: string): Promise<IFullUploadVideoJobPersistanceDocument | null>;

  getPopulatedJobByUploadID(uploadID: string): Promise<IFullUploadVideoJobPersistanceDocument | null>;
}

@Service()
export default class UploadVideoJobRepository {
  constructor(@Inject(NAMES.Logger) private logger: Logger) {}

  public async getPopulatedJob(uploadJobID: string): Promise<IFullUploadVideoJobPersistanceDocument | null> {
    try {
      const job = await UploadVideoJobModel.findOne({ _id: uploadJobID })
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

      return job as IFullUploadVideoJobPersistanceDocument;
    } catch (error) {
      this.logger.error(`[UploadVideoJobRepository, getPopulatedJob]: ${error}`);

      throw error;
    }
  }

  public async getPopulatedJobByUploadID(uploadID: string): Promise<IFullUploadVideoJobPersistanceDocument | null> {
    try {
      const job = await UploadVideoJobModel.findOne({ uploadID: uploadID })
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

      return job as IFullUploadVideoJobPersistanceDocument;
    } catch (error) {
      this.logger.error(`[UploadVideoJobRepository, getPopulatedJobByUploadID]: ${error}`);

      throw error;
    }
  }
}
