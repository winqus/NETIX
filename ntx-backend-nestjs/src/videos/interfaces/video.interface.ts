import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Document } from 'mongoose';
import { VideoCategory } from './videoCategory.enum';

export interface Video extends Entity, Document {
  readonly uuid: string;
  readonly type: VideoCategory;
}
