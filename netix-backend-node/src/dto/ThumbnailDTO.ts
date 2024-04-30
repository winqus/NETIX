import { ThumbnailState } from '../core/states/ThumbnailState';

export default interface ThumbnailDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  mimeType: string;
  ready: boolean;
  state: ThumbnailState;
}
