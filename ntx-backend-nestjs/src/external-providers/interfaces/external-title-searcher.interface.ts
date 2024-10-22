import { ExternalTitleSearchRequest, ExternalTitleSearchResultItem } from '../external-providers.types';

export interface IExternalTitleSearcher {
  searchTitleByName(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultItem[]>;
}
