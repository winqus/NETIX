export default interface VideoThumbnailUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  thumbnailData: Blob;
}
