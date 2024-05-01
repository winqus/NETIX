import { MetadataState } from '../core/states/MetadataState';

export default interface MetadataDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  publishDatetime: Date;
  ready: boolean;
  state: MetadataState;
}
