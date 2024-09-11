import { Title } from '@ntx/titles-legacy/interfaces/title.interface';
import { Season } from './season.interface';

export interface SeriesTitle extends Title {
  seasons: Season[];
}
