import { Entity } from './entity.interface';

export interface Title extends Entity {
  posterID: string;
  name: string;
  type: string;
  hash: string;
  isPublished: boolean;
}
