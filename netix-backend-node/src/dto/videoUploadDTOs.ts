export interface VideoUploadConstraintsDTO {
  videoFileConstraints: VideoFileUploadContraintsDTO;
  thumbnailConstraints: VideoThumbnailUploadConstraintsDTO;
}

export interface VideoFileUploadContraintsDTO {
  maxDurationInSeconds: number;
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
  resolution: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface VideoThumbnailUploadConstraintsDTO {
  maxSizeInBytes: number;
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

export interface VideoUploadRequestDTO {
  fileName: string;
  fileSizeInBytes: number;
  mimeType: string;
  durationInSeconds: number;
}

export interface VideoRequestTokenProperties {
  requestId: string;
  creationTime: Date;
  expirationTime: Date;
  userId: string;
  videoId: string;
}

export interface VideoUploadRequestResponseDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
}

export interface VideoChunkUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  chunkIndex: number;
  chunkData: Blob;
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
