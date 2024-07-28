import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { TitleDetailedSearchResult } from 'src/external-search/interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from 'src/external-search/interfaces/TitleSearchResult.interface';

export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;

  init(config: TitleSearchPluginConfig): boolean;

  search(query: string, type?: TitleType, maxResults?: number): Promise<TitleSearchResult[]>;

  searchDetailsById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null>;

  canCall(): boolean;

  timeToNextCall(): number;

  resetRateLimit(): void;
}
