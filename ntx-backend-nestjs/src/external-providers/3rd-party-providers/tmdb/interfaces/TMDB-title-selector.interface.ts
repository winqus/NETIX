import { TMDBTitle, WeightedTMDBTitle } from './TMDBTitle';

export interface TMDBTitleSelectionArgs {
  candidates: TMDBTitle[];
  query: string;
  maxResults: number;
}

export interface TMDBTitleSelector {
  select(args: TMDBTitleSelectionArgs): Promise<WeightedTMDBTitle[]>;
}
