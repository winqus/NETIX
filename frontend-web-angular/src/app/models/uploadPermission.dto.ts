export interface PermissionRequestDTO {
  fileName: string;
  mimeType: string;
  fileSizeInBytes: number;
  durationInSeconds: number;
}

export interface PermissionResponseDTO {
  uploadId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
}
