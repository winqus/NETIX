import { TMDBSearchResult } from './TMDBSearchResult';
import { TMDBTVShow } from './TMDBTVShow';
import { TMDBTVShowDetails } from './TMDBTVShowDetails';

export interface TMDBTVShowSearchOptions {
  query: string;
  year?: string;
  language?: string;
  include_adult?: string;
}

export interface TMDBTVShowGateway {
  search(options: TMDBTVShowSearchOptions): Promise<TMDBSearchResult<TMDBTVShow>[] | null>;

  getDetailsByID(tvShowID: string): Promise<TMDBTVShowDetails | null>;
}
