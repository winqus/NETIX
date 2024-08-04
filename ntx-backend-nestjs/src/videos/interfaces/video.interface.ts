import { Entity } from '@ntx/common/interfaces/entity.interface';
import { VideoCategory } from './videoCategory.enum';

export interface Video extends Entity {
  readonly type: VideoCategory;
}
