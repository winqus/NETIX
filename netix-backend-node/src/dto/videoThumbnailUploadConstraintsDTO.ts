export default interface VideoThumbnailUploadConstraintsDTO {
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
