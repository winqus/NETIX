import VideoUploadRequest from '../../core/entities/VideoUploadRequest';

export default interface IVideoUploadRepository {
  save(request: VideoUploadRequest): Promise<VideoUploadRequest>;

  findByRequestId(requestId: string): Promise<VideoUploadRequest | null>;

  findByVideoId(videoId: string): Promise<VideoUploadRequest | null>;

  delete(requestId: string): Promise<boolean>;
}
