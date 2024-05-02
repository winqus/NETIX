import { VideoState } from '../core/states/VideoState';

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
    // video: {
    //   lengthInSeconds: number;
    //   resolution: string; // e.g., "1920x1080"
    //   codec: string; // e.g., "H.264"
    //   frameRate: number; // e.g., 30
    // };
  };
  // videoStream: {
  //   createdDateTime: Date;
  //   updatedDateTime: Date;
  //   protocol: 'HLS';
  //   totalSizeInBytes: number;
  //   streamID: string;
  //   accessURL: string;
  // };
}
