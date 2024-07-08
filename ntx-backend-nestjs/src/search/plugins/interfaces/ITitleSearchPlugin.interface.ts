export interface TitleSearchPluginConfig {
  usePlugin: boolean;
  options: { apiKey: string } | { [key: string]: string };
  timeBetweenCallsMs: number;
}

export interface PluginLoaderConfigLUT {
  [plugin_uuid: string]: TitleSearchPluginConfig;
}

export type TitleType = 'MOVIE' | 'SERIES';

export interface ITitleSearchPlugin {
  readonly pluginUUID: string;

  init(config: TitleSearchPluginConfig): boolean;

  search(query: string): Promise<TitleSearchResult[]>;

  searchById(
    id: string,
    type: TitleType,
  ): Promise<TitleDetailedSearchResult | null>;

  canCall(): boolean;

  timeToNextCall(): number;

  resetRateLimit(): void;
}

export interface TitleSearchResult {
  title: string;
  originalTitle: string;
  id: string;
  type: TitleType;
  weight: number;
  releaseDate: string;
  sourceUUID: string;
}

export interface TitleDetailedSearchResult {
  title: string;
  originalTitle: string;
  id: string;
  type: TitleType;
  releaseDate: string;
  sourceUUID: string;
  details: MovieDetails | SeriesDetails;
}

export interface MovieDetails {
  runtime: number;
}

export interface SeriesDetails {
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons: {
    id: string;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    releaseDate: string | null; // null if not released yet
  };
}
