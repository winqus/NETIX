export default interface VideoMetadataUploadDTO {
  requestId: string;
  requestToken: string;
  videoId: string;
  metadata: {
    title: string;
    description: string;
    durationSeconds: number;
    tags: string[];
    categories: string[];
    publishedAt: Date;
  };
}
