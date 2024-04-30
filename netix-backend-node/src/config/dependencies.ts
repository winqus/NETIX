import MetadataModel from '../persistence/schemas/Metadata.model';
import { default as ThumbnailModel } from '../persistence/schemas/Thumbnail.model';
import UploadModel from '../persistence/schemas/Upload.model';
import UploadVideoJobModel from '../persistence/schemas/UploadVideoJob.model';
import VideoModel from '../persistence/schemas/Video.model';
import SystemFileService from '../services/SystemFileService';
import UploadService from '../services/UploadService';
import UploadVideoJobService from '../services/UploadVideoJobService';

export const NAMES = {
  Logger: 'logger',
  Redis: 'redis',
  SCHEMAS: {
    Video: 'VideoSchema',
    Metadata: 'MetadataSchema',
    Thumbnail: 'ThumbnailSchema',
    Upload: 'UploadSchema',
    UploadVideoJob: 'UploadVideoJobSchema',
  },
  REPOSITORIES: {
    // TODO repository names
  },
  SERVICES: {
    Upload: 'UploadService',
    UploadVideoJob: 'UploadVideoJobService',
  },
  QUEUES: {
    // TODO queue names
  },
  WORKERS: {
    // TODO worker names
  },
};

export interface DependencyConfig {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
}

const dependencyConfig: DependencyConfig = {
  schemas: [
    // { name: 'VideoMetadataSchema', class: videoMetadataSchema },
    // { name: 'VideoSchema', class: videoSchema },
    // { name: 'ThumbnailSchema', class: thumbnailSchema },
    // { name: 'VideoUploadRequestSchema', class: videoUploadRequestSchema },
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
    { name: 'FileService', class: SystemFileService },
    { name: NAMES.SERVICES.Upload, class: UploadService },
    { name: NAMES.SERVICES.UploadVideoJob, class: UploadVideoJobService },

    // { name: 'VideoUploadService', class: VideoUploadService },
    // { name: 'VideoUploadRequestService', class: VideoUploadRequestService },
  ],
};

export default dependencyConfig;
