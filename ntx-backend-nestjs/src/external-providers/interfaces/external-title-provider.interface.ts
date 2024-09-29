import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import {
  ExternalTitle,
  ExternalTitleMetadataRequest,
  ExternalTitleMetadataResult,
  ExternalTitleSearchResultCandidate,
} from '../external-providers.types';

export interface ExternalTitleSearchOptions {
  types?: TitleType[];
  maxResults?: number;
}

export interface IExternalTitleProvider {
  getProviderID(): string;

  exists(title: ExternalTitle): Promise<boolean>;

  findByQuery(query: string, options?: ExternalTitleSearchOptions): Promise<ExternalTitleSearchResultCandidate[]>;

  getMetadata<T extends TitleType>(request: ExternalTitleMetadataRequest<T>): Promise<ExternalTitleMetadataResult<T>>;
}
