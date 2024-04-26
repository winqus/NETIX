import { Result } from '../../core/logic/Result';
import { VideoChunkUploadDTO, VideoUploadConstraintsDTO } from '../../dto/videoUploadDTOs';

export default interface IVideoUploadService {
  getVideoUploadConstraints(): Promise<Result<VideoUploadConstraintsDTO>>;

  saveVideoChunkFile(videoChunkUpload: VideoChunkUploadDTO, overwrite?: boolean): Promise<Result<void>>;
}
