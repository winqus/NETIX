import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { Thumbnail } from '@ntx/thumbnails-legacy/interfaces/thumbnail.interface';
import { Episode } from './episode.interface';

export interface Season extends Entity {
  seasonNumber: number;
  names: Name[];
  thumbnail: Thumbnail;
  releaseDate: Date;
  episodes: Episode[];
}
