import thumbnailSchema from '../persistence/schemas/thumbnail.schema';
import videoSchema from '../persistence/schemas/video.schema';
import videoMetadataSchema from '../persistence/schemas/videoMetadata.schema';
import videoUploadRequestSchema from '../persistence/schemas/videoUploadRequest.schema';
import VideoUploadRequestRepository from '../repositories/VideoUploadRequestRepository';
import SystemFileService from '../services/SystemFileService';
import VideoUploadRequestService from '../services/VideoUploadRequestService';
import VideoUploadService from '../services/VideoUploadService';

export interface DependencyConfig {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
}

const dependencyConfig: DependencyConfig = {
  schemas: [
    { name: 'VideoMetadataSchema', class: videoMetadataSchema },
    { name: 'VideoSchema', class: videoSchema },
    { name: 'ThumbnailSchema', class: thumbnailSchema },
    { name: 'VideoUploadRequestSchema', class: videoUploadRequestSchema },
  ],

  repositories: [{ name: 'VideoUploadRequestRepository', class: VideoUploadRequestRepository }],

  services: [
    { name: 'FileService', class: SystemFileService },
    { name: 'VideoUploadService', class: VideoUploadService },
    { name: 'VideoUploadRequestService', class: VideoUploadRequestService },
  ],
};

export default dependencyConfig;
