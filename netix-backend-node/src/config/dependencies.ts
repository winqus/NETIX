import Metadata from '../core/entities/Metadata';
import UploadVideoJob from '../core/entities/UploadVideoJob';
import MetadataModel from '../persistence/schemas/Metadata.model';
import { default as ThumbnailModel, default as thumbnailSchema } from '../persistence/schemas/Thumbnail.model';
import UploadModel from '../persistence/schemas/Upload.model';
import UploadVideoJobModel from '../persistence/schemas/UploadVideoJob.model';
import VideoModel from '../persistence/schemas/Video.model';
import videoSchema from '../persistence/schemas/video.schema';
import videoMetadataSchema from '../persistence/schemas/videoMetadata.schema';
import videoUploadRequestSchema from '../persistence/schemas/videoUploadRequest.schema';
import VideoUploadRequestRepository from '../repositories/VideoUploadRequestRepository';
import SystemFileService from '../services/SystemFileService';
import UploadService from '../services/UploadService';
import VideoUploadRequestService from '../services/VideoUploadRequestService';
import VideoUploadService from '../services/VideoUploadService';

export const NAMES = {
  LOGGER: 'logger',
  REDIS: 'redis',
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
    // { name: 'VideoUploadService', class: VideoUploadService },
    // { name: 'VideoUploadRequestService', class: VideoUploadRequestService },
  ],
};

export default dependencyConfig;
