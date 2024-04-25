import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../core/states/VideoUploadRequest.state';

export interface VideoUploadConstraintsDTO {
  videoFileConstraints: VideoFileUploadContraintsDTO;
  thumbnailConstraints: VideoThumbnailUploadConstraintsDTO;
}

export interface VideoFileUploadContraintsDTO {
  durationInSeconds: { min: number; max: number };
  sizeInBytes: { min: number; max: number };
  allowedMimeTypes: string[];
  resolution: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface VideoThumbnailUploadConstraintsDTO {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  resolution: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  aspectRatio: {
    width: number;
    height: number;
  };
}

export interface NewVideoUploadRequestDTO {
  fileName: string;
  fileSizeInBytes: number;
  mimeType: string;
  durationInSeconds: number;
  userId: string;
}

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

// export interface VideoRequestTokenProperties {
//   requestId: string;
//   creationTime: Date;
//   expirationTime: Date;
//   userId: string;
//   videoId: string;
// }

export interface NewVideoUploadRequestResponseDTO {
  requestId: string;
  videoId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
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
