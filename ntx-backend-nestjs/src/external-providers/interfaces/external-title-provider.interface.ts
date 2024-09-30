import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitle, ExternalTitleMetadataResult, ExternalTitleSearchResultItem } from '../external-providers.types';

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

  getMetadata<T extends TitleType>(externalID: string, type: T): Promise<ExternalTitleMetadataResult<T> | null>;
}
