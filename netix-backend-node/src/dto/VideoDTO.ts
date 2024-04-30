import { VideoState } from '../core/states/VideoState';

export default interface VideoDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  lengthInSeconds: number;
  sizeInBytes: number;
  ready: boolean;
  state: VideoState;
}
