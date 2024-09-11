import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Thumbnail } from '@ntx/thumbnails-legacy/interfaces/thumbnail.interface';

export interface Title extends Entity {
  thumbnail?: Thumbnail;
  names: Name[];
  releaseDate: Date;
  type: TitleType;
}
