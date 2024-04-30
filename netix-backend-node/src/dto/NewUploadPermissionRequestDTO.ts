export default interface NewUploadPermissionRequestDTO {
  userId: string;
  fileName: string;
  mimeType: string;
  fileSizeInBytes: number;
  durationInSeconds: number;
}
