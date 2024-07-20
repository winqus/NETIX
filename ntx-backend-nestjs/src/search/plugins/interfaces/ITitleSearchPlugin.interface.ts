import { TitleDetailedSearchResult } from 'src/search/interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from 'src/search/interfaces/TitleSearchResult.interface';
import { TitleType } from 'src/search/interfaces/TitleType.enum';

export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;

  init(config: TitleSearchPluginConfig): boolean;

  search(query: string, type?: TitleType, maxResults?: number): Promise<TitleSearchResult[]>;

  searchById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null>;

  canCall(): boolean;

  timeToNextCall(): number;

  resetRateLimit(): void;
}
