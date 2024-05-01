import { Result } from '../../core/logic/Result';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';
import MetadataDTO from '../../dto/MetadataDTO';
import { UploadMetadataRequestDTO } from '../../dto/UploadMetadataDTO';

export default interface IUploadVideoJobService {
  getFullByUploadID(uploadID: string): Promise<Result<FullUploadVideoJobDTO>>;

  getPendingOrInProgressForUserByUploadID(userID: string, uploadID: string): Promise<Result<FullUploadVideoJobDTO>>;

  updateChunkUploadProgress(uploadID: string, chunkIndex: number): Promise<Result<void>>;

  uploadMetadata(uploadID: string, metadata: UploadMetadataRequestDTO): Promise<Result<MetadataDTO>>;

  updateThumbnailUploadProgress(uploadID: string): Promise<Result<void>>;
}
