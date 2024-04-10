export default interface VideoUploadRequestDTO {
  fileName: string;
  fileSizeInBytes: number;
  mimeType: string;
  durationInSeconds: number;
}
