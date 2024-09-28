import { ExternalTitleSearchRequest, ExternalTitleSearchResult } from './external-providers.types';

export interface IExternalTitleSearchService {
  search(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResult>;
}
