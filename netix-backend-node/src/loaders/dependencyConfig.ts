// Move all imports to the top level of the file
import { NAMES } from '../config/dependencies';
import MetadataModel from '../persistence/schemas/Metadata.model';
import ThumbnailModel from '../persistence/schemas/Thumbnail.model';
import UploadModel from '../persistence/schemas/Upload.model';
import UploadVideoJobModel from '../persistence/schemas/UploadVideoJob.model';
import VideoModel from '../persistence/schemas/Video.model';
import RawUploadFileService from '../services/RawUploadFileService';
import UploadService from '../services/UploadService';
import UploadVideoJobService from '../services/UploadVideoJobService';
import VideoService from '../services/VideoService';
import SystemFileService from '../services/systemFileService';

export interface DependencyConfig {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
}

export const dependencyConfig: DependencyConfig = {
  schemas: [
    { name: NAMES.SCHEMAS.Metadata, class: MetadataModel },
    { name: NAMES.SCHEMAS.Video, class: VideoModel },
    { name: NAMES.SCHEMAS.Thumbnail, class: ThumbnailModel },
    { name: NAMES.SCHEMAS.Upload, class: UploadModel },
    { name: NAMES.SCHEMAS.UploadVideoJob, class: UploadVideoJobModel },
  ],
  repositories: [
    // { name: 'VideoUploadRequestRepository', class: VideoUploadRequestRepository }
  ],
  services: [
    { name: NAMES.SERVICES.SystemFile, class: SystemFileService },
    { name: NAMES.SERVICES.RawUpload, class: RawUploadFileService },
    { name: NAMES.SERVICES.Upload, class: UploadService },
    { name: NAMES.SERVICES.UploadVideoJob, class: UploadVideoJobService },
    { name: NAMES.SERVICES.Video, class: VideoService },
  ],
};
