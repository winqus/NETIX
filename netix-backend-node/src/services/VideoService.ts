import { Inject, Service } from 'typedi';
import { validate } from 'uuid';
import { Logger } from 'winston';
import { Result } from '../core/logic/Result';
import WatchableVideoDTO from '../dto/WatchableVideoDTO';
import { UploadMapper } from '../mappers/UploadMapper';
import UploadModel from '../persistence/schemas/Upload.model';

export interface IVideoService {
  getVideosAtPageAndLimit(page: number, limit: number): Promise<Result<WatchableVideoDTO[]>>;

  getVideoByUploadID(uploadID: string): Promise<Result<WatchableVideoDTO>>;
}

@Service()
export default class VideoService implements IVideoService {
  constructor(@Inject('logger') private logger: Logger) {}

  public async getVideosAtPageAndLimit(page: number, limit: number): Promise<Result<WatchableVideoDTO[]>> {
    try {
      if (page == null || limit == null) {
        throw new Error('Page and limit must be provided');
      }

      if (page < 0 || limit < 0) {
        this.logger.error(`[UploadService, getUploadConstraints]: Invalid page (${page}) or limit (${limit}) value`);

        return Result.fail('Invalid page or limit value');
      }

      const paginationOptions = {
        page: page,
        limit: limit,
        sort: { createdAt: -1 }, // Sorting by createdAt in descending order
        populate: ['metadataID', 'thumbnailID', 'videoID'],
      };

      const uploads = await UploadModel.paginate({}, paginationOptions);

      const uploadDTOs = uploads.docs.map((upload) => UploadMapper.fullPersistenceToDTO(upload));

      const response: WatchableVideoDTO[] = uploadDTOs.map((uploadDTO) => UploadMapper.UploadDTO_to_WatchableVideoDTO(uploadDTO));

      return Result.ok(response);
    } catch (error) {
      this.logger.error(`[UploadService, getUploadConstraints]: ${error}`);

      throw error;
    }
  }

  public async getVideoByUploadID(uploadID: string): Promise<Result<WatchableVideoDTO>> {
    try {
      if (validate(uploadID) === false) {
        this.logger.error(`[UploadService, getVideoByUploadID]: Invalid upload ID (${uploadID})`);

        return Result.fail('Invalid upload ID');
      }

      const upload = await UploadModel.findOne({ _id: uploadID }).populate('metadataID thumbnailID videoID');

      if (!upload) {
        this.logger.error(`[UploadService, getVideoByUploadID]: Video not found by upload ID (${uploadID})`);

        return Result.fail('Video not found');
      }

      const uploadDTO = UploadMapper.fullPersistenceToDTO(upload);

      const response = UploadMapper.UploadDTO_to_WatchableVideoDTO(uploadDTO);

      return Result.ok(response);
    } catch (error) {
      this.logger.error(`[UploadService, getVideoByUploadID]: ${error}`);

      throw error;
    }
  }
}
