export interface NewUploadPermissionResponseDTO {
  uploadId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
}
