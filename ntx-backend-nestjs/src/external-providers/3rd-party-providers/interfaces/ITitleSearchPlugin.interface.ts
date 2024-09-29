import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { TitleDetailedSearchResult } from '@ntx/external-providers/interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';

export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;

  search(query: string, type?: TitleType, maxResults?: number): Promise<TitleSearchResult[]>;

  searchDetailsById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null>;
}
