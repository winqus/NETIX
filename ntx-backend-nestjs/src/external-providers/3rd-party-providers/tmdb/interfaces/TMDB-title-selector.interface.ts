import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';
import { TMDBTitle } from './TMDBTitle';

export interface TMDBTitleSelectionArgs {
  candidates: TMDBTitle[];
  query: string;
  maxResults: number;
}

export interface TMDBTitleSelector {
  select(args: TMDBTitleSelectionArgs): Promise<TitleSearchResult[]>;
}
