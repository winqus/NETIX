import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleSearchResultCandidate } from '../external-providers.types';

export interface ExternalTitleSearchOptions {
  types?: TitleType[];
  maxResults?: number;
}

export interface IExternalTitleProvider {
  getProviderID(): string;
  findByQuery(query: string, options?: ExternalTitleSearchOptions): Promise<ExternalTitleSearchResultCandidate[]>;
}
