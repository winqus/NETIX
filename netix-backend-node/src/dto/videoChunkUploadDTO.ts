export default interface VideoChunkUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  chunkIndex: number;
  chunkData: Blob;
}
