import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { TMDBMovie } from './TMDBMovie';
import { TMDBMovieDetails } from './TMDBMovieDetails';
import { TMDBTVShow } from './TMDBTVShow';
import { TMDBTVShowDetails } from './TMDBTVShowDetails';

export type TMDBTitle = TMDBMovie | TMDBTVShow;

export type WeightedTMDBTitle = TMDBTitle & { weight: number };

export type TMDBTitleDetails = TMDBMovieDetails | TMDBTVShowDetails;

export type TMDBTitleDetailsMap = {
  [TitleType.MOVIE]: TMDBMovieDetails;
  [TitleType.SERIES]: TMDBTVShowDetails;
};
