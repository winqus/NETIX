import { ExternalTitleSearchResultItem } from '../external-providers.types';

export interface ExternalTitleSelectionArgs {
  candidates: ExternalTitleSearchResultItem[];
  searchedQuery: string;
}

export interface IExternalTitleSelector {
  select(args: ExternalTitleSelectionArgs): Promise<ExternalTitleSearchResultItem[]>;
}
