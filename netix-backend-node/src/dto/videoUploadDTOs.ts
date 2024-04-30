import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';

export interface VideoUploadRequestDTO {
  requestId: string;
  createdAt: Date;
  updatedAt: Date;
  videoId: string;
  requesterId: string;
  videoState: VideoUploadState;
  thumbnailId?: string;
  thumbnailState: ThumbnailUploadState;
  metadataId?: string;
  metadataState: MetadataUploadState;
  overallState: VideoUploadRequestState;
  chunksReceived: number;
  totalChunks: number;
}

export interface VideoChunkUploadDTO {
  requestId: string;
  videoId: string;
  chunkIndex: number;
  chunkData: Buffer;
}

export interface VideoChunkUploadResponseDTO {
  success: boolean;
  requestId: string;
  chunkIndex: number;
  uploadComplete?: boolean;
  code: string;
  message?: string;
}

export interface VideoThumbnailUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  thumbnailData: Blob;
}

export interface VideoThumbnailUploadResponseDTO {
  success: boolean;
  videoId: string;
  message?: string;
  thumbnailUrl?: string;
}

export interface VideoMetadataUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  metadata: {
    title: string;
    description: string;
    durationSeconds: number;
    tags: string[];
    categories: string[];
    publishedAt: Date;
  };
}

export interface VideoMetadataUploadResponseDTO {
  success: boolean;
  videoId: string;
  message?: string;
}
