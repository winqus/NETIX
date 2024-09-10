import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { Thumbnail } from '@ntx/thumbnails-legacy/interfaces/thumbnail.interface';
import { Video } from '@ntx/videos-legacy/interfaces/video.interface';

export interface Episode extends Entity {
  episodeNumber: number;
  names: Name[];
  runtimeMinutes: number;
  thumbnail: Thumbnail;
  video?: Video;
}
