import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Video } from '@ntx/videos/interfaces/video.interface';

export interface MovieDetails extends Entity {
  runtimeMinutes: number;
  videos: [Video];
}
