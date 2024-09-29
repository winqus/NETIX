import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleSearchResultItem } from '@ntx/external-providers/external-providers.types';
import { TitleDetailedSearchResult } from '@ntx/external-providers/interfaces/TitleDetailedSearchResult.interface';

export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;

  searchDetailsById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null>;
}
