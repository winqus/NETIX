import { Result } from '../../core/logic/Result';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';

export default interface IUploadVideoJobService {
  getFullByUploadID(uploadID: string): Promise<Result<FullUploadVideoJobDTO>>;

  getPendingOrInProgressForUserByUploadID(userID: string, uploadID: string): Promise<Result<FullUploadVideoJobDTO>>;

  updateChunkUploadProgress(uploadID: string, chunkIndex: number): Promise<Result<void>>;
}
