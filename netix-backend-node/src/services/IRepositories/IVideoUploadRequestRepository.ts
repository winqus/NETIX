import VideoUploadRequest from '../../core/entities/VideoUploadRequest';
import { Result } from '../../core/logic/Result';

export default interface IVideoUploadRequestRepository {
  create(request: VideoUploadRequest): Promise<Result<VideoUploadRequest>>;

  update(request: VideoUploadRequest): Promise<Result<VideoUploadRequest>>;

  findByRequestId(requestId: string): Promise<Result<VideoUploadRequest | null>>;

  findByVideoId(videoId: string): Promise<Result<VideoUploadRequest | null>>;

  delete(requestId: string): Promise<Result<void>>;
}
