import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Season } from './season.interface';

export interface SeriesDetails extends Entity {
  seasonCount: number;
  episodesCount: number;
  seasons: [Season];
}
