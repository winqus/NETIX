import { Result } from '../../core/logic/Result';
import { UploadConstraintsDTO } from '../../dto/UploadConstraintsDTO';

export default interface IUploadService {
  getUploadConstraints(): Promise<Result<UploadConstraintsDTO>>;
}
