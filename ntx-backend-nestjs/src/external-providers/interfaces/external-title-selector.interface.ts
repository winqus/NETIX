import { ExternalTitleSearchResult, ExternalTitleSearchResultCandidate } from '../external-providers.types';

export interface ExternalTitleSelectionArgs {
  candidates: ExternalTitleSearchResultCandidate[];
  searchedQuery: string;
}

export interface IExternalTitleSelector {
  select(args: ExternalTitleSelectionArgs): Promise<ExternalTitleSearchResult[]>;
}
