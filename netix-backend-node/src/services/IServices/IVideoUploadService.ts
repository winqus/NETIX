import { Result } from '../../core/logic/Result';
import { VideoChunkUploadDTO } from '../../dto/videoUploadDTOs';

export default interface IVideoUploadService {
  saveVideoChunkFile(videoChunkUpload: VideoChunkUploadDTO, overwrite?: boolean): Promise<Result<void>>;
}
