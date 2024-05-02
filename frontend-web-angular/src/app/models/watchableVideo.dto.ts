export enum VideoState {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  WAITING_FOR_PROCESSING = 'waiting_for_processing',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export default interface WatchableVideoDTO {
  uploadID: string;
  uploaderID: string;
  createdDateTime: Date;
  uploadedDateTime: Date;
  state: VideoState;
  ready: boolean;
  thumbnail: {
    createdDateTime: Date;
    updatedDateTime: Date;
    thumbnailID: string;
    mimeType: string;
  };
  metadata: {
    createdDateTime: Date;
    updatedDateTime: Date;
    description: {
      title: string;
      publishDatetime: Date;
    };
  };
}
