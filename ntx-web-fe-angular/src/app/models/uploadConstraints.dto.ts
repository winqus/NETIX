export interface UploadConstraintsDTO {
  videoFileConstraints: VideoFileUploadContraintsDTO;
  thumbnailConstraints: ThumbnailUploadConstraintsDTO;
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

export interface ThumbnailUploadConstraintsDTO {
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
