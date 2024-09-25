import { PluginConfig, PluginConfigLUT } from './plugins/interfaces/PluginConfigLUT.interface';

export enum ExternalProviders {
  TMDB_SEARCH_V3 = 'TMDB_SEARCH_V3',
}

export const pluginConfig: PluginConfigLUT = {
  [ExternalProviders.TMDB_SEARCH_V3]: {
    usePlugin: true,
    options: {
      apiKey: process.env['TMDB_API_KEY'] || '',
    },
    timeBetweenCallsMs: 100,
  },
};

export const getConfigForSource = (source: ExternalProviders): PluginConfig | undefined => {
  const pluginConfig: PluginConfigLUT = {
    [ExternalProviders.TMDB_SEARCH_V3]: {
      usePlugin: true,
      options: {
        apiKey: process.env['TMDB_API_KEY'] || '',
      },
      timeBetweenCallsMs: 100,
    },
  };

  return pluginConfig[source];
};

export const CONTROLLER_VERSION = '1';
export const CONTROLLER_BASE_PATH = 'search';
