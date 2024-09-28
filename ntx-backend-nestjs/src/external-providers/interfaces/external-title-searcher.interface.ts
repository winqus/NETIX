import { ExternalTitleSearchRequest, ExternalTitleSearchResultCandidate } from '../external-providers.types';

export interface IExternalTitleSearcher {
  searchTitleByName(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultCandidate[]>;
}
