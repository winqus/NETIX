import { Result } from '../../core/logic/Result';
import { NewVideoUploadRequestDTO, VideoUploadRequestDTO } from '../../dto/videoUploadDTOs';

export default interface IVideoUploadRequestService {
  getVideoUploadRequest(requestId: string): Promise<Result<VideoUploadRequestDTO>>;

  createVideoUploadRequest(newUploadRequestDTO: NewVideoUploadRequestDTO): Promise<Result<VideoUploadRequestDTO>>;
}
