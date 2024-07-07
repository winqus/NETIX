export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface PluginLoaderConfigLUT {
  [plugin_uuid: string]: TitleSearchPluginConfig;
}

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;
  init(config: TitleSearchPluginConfig): boolean;
  search(query: string): Promise<any>;
  canCall(): boolean;
  timeToNextCall(): number;
  resetRateLimit(): void;
}

export interface TitleSearchResult {
  title: string;
  originalTitle: string;
  id: string;
  type: 'MOVIE' | 'SERIES';
  weight: number;
  releaseDate: string;
  sourceUUID: string;
}
