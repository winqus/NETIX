export default interface NewUploadPermissionRequestDTO {
  userId: string;
  fileName: string;
  mimeType: string;
  fileSizeInBytes: number;
  durationInSeconds: number;
}

export interface NewUploadPermissionResponseDTO {
  uploadId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
}
