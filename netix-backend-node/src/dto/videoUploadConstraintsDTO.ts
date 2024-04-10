import VideoFileUploadContraintsDTO from './videoFileUploadConstraintsDTO';
import VideoThumbnailUploadConstraintsDTO from './videoThumbnailUploadConstraintsDTO';

export default interface VideoUploadConstraintsDTO {
  videoFileConstraints: VideoFileUploadContraintsDTO;
  thumbnailConstraints: VideoThumbnailUploadConstraintsDTO;
}
