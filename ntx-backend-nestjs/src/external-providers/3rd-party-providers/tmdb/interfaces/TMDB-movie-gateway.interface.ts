import { TMDBMovie } from './TMDBMovie';
import { TMDBMovieDetails } from './TMDBMovieDetails';
import { TMDBSearchResult } from './TMDBSearchResult';

export interface TMDBMovieSearchOptions {
  query: string;
  year?: string;
  language?: string;
  include_adult?: 'true' | 'false';
}

export interface TMDBMovieGateway {
  search(options: TMDBMovieSearchOptions): Promise<TMDBSearchResult<TMDBMovie>[] | null>;

  getDetailsByID(movieID: string): Promise<TMDBMovieDetails | null>;
}
