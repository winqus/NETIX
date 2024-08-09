import { Entity } from '@ntx/common/interfaces/entity.interface';
import { ThumbnailCategory } from './thumbnailCategory.enum';
import { ThumbnailFormat } from './thumbnailFormat.enum';

export interface Thumbnail extends Entity {
  type: ThumbnailCategory;
  format: ThumbnailFormat;
}
