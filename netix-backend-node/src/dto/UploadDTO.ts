import { UploadState } from '../core/states/UploadState';
import MetadataDTO from './MetadataDTO';
import ThumbnailDTO from './ThumbnailDTO';
import VideoDTO from './VideoDTO';

export default interface UploadDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  uploaderID: string;
  ready: boolean;
  state: UploadState;
  video: VideoDTO;
  metadata: MetadataDTO;
  thumbnail: ThumbnailDTO;
}
