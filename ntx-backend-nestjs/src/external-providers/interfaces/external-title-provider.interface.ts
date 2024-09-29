import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import {
  ExternalTitle,
  ExternalTitleMetadataRequest,
  ExternalTitleMetadataResult,
  ExternalTitleSearchResultItem,
} from '../external-providers.types';

export interface ExternalProviderConfig {
  enabled: boolean;
}

export interface ExternalTitleSearchOptions {
  types?: TitleType[];
  maxResults?: number;
}

export interface IExternalTitleProvider {
  getProviderID(): string;

  exists(title: ExternalTitle): Promise<boolean>;

  search(query: string, options?: ExternalTitleSearchOptions): Promise<ExternalTitleSearchResultItem[]>;

  getMetadata<T extends TitleType>(request: ExternalTitleMetadataRequest<T>): Promise<ExternalTitleMetadataResult<T>>;
}
