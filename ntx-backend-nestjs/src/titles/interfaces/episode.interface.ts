import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { Thumbnail } from '@ntx/thumbnails/interfaces/thumbnail.interface';
import { Video } from '@ntx/videos/interfaces/video.interface';

export interface Episode extends Entity {
  episodeNumber: number;
  names: [Name];
  runtimeMinutes: number;
  thumbnails: [Thumbnail];
  videos: [Video];
}
