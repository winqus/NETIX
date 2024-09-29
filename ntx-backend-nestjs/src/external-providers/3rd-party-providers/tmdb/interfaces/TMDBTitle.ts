import { TMDBMovie } from './TMDBMovie';
import { TMDBTVShow } from './TMDBTVShow';

export type TMDBTitle = TMDBMovie | TMDBTVShow;

export type WeightedTMDBTitle = TMDBTitle & { weight: number };
