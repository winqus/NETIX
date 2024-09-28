import { PluginConfig, PluginConfigLUT } from './plugins/interfaces/PluginConfigLUT.interface';

export enum ExternalProviders {
  TMDB = 'TMDB',
}

export const EXTERNAL_TITLE_SEARCHER_TOKEN = 'external_title_searcher_token';
export const EXTERNAL_TITLE_SELECTOR_TOKEN = 'external_title_selector_token';

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
