import { ExternalTitleSearchRequest, ExternalTitleSearchResultDTO } from './external-providers.types';

export interface IExternalTitleSearchService {
  search(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultDTO>;
}
