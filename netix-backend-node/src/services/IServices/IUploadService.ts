import { Result } from '../../core/logic/Result';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';
import NewUploadPermissionRequestDTO from '../../dto/NewUploadPermissionRequestDTO';
import { NewUploadPermissionResponseDTO } from '../../dto/NewUploadPermissionResponseDTO';
import { UploadConstraintsDTO } from '../../dto/UploadConstraintsDTO';

export default interface IUploadService {
  getUploadConstraints(): Promise<Result<UploadConstraintsDTO>>;

  getPermissionToUpload(uploadRequest: NewUploadPermissionRequestDTO): Promise<Result<NewUploadPermissionResponseDTO>>;

  getUserUploadInProgress(userId: string): Promise<Result<FullUploadVideoJobDTO>>;
}
