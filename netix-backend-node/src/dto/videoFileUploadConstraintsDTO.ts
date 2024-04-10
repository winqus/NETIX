export default interface VideoFileUploadContraintsDTO {
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
