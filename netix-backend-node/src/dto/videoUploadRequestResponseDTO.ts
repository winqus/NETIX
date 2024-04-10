export default interface VideoUploadRequestResponseDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  uploadUrl: string;
  totalChunksCount: number;
  allowedUploadRateInChunksAtOnce: number;
  chunkBaseName: string;
}
