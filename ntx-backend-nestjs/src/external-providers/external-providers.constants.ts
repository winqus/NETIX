import { PluginConfig, PluginConfigLUT } from './3rd-party-providers/interfaces/PluginConfigLUT.interface';

export enum ExternalProviders {
  TMDB = 'TMDB',
}

export const DEFAULT_EXTERNAL_TITLE_SEARCH_MAX_RESULTS = 10;

export const EXTERNAL_TITLE_SEARCHER_TOKEN = 'external_title_searcher_token';
export const EXTERNAL_TITLE_SELECTOR_TOKEN = 'external_title_selector_token';
export const EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN = 'external_title_metadata_retriever_token';

export const pluginConfig: PluginConfigLUT = {
  [ExternalProviders.TMDB]: {
    usePlugin: true,
    options: {
      apiKey: process.env['TMDB_API_KEY'] || '',
    },
    timeBetweenCallsMs: 100,
  },
};

export const getConfigForSource = (source: ExternalProviders): PluginConfig | undefined => {
  const pluginConfig: PluginConfigLUT = {
    [ExternalProviders.TMDB]: {
      usePlugin: true,
      options: {
        apiKey: process.env['TMDB_API_KEY'] || '',
      },
      timeBetweenCallsMs: 100,
    },
  };

  return pluginConfig[source];
};
