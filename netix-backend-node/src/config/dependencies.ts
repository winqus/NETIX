import thumbnailSchema from '../persistence/schemas/thumbnail.schema';
import videoSchema from '../persistence/schemas/video.schema';
import videoMetadataSchema from '../persistence/schemas/videoMetadata.schema';
import videoUploadRequestSchema from '../persistence/schemas/videoUploadRequest.schema';
import VideoUploadRepository from '../repositories/VideoUploadRepository';
import VideoUploadRequestRepository from '../repositories/VideoUploadRequestRepository';
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

  repositories: [
    { name: 'VideoUploadRepository', class: VideoUploadRepository },
    { name: 'VideoUploadRequestRepository', class: VideoUploadRequestRepository },
  ],

  services: [
    { name: 'VideoUploadService', class: VideoUploadService },
    { name: 'VideoUploadRequestService', class: VideoUploadRequestService },
  ],
};

export default dependencyConfig;
