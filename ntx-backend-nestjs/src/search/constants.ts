import { PluginLoaderConfigLUT } from './plugins/interfaces/PluginLoaderConfigLUT.interface';

export const SYSTEM_SEARCH_TITLES = 'SYSTEM_SEARCH_TITLES';
export const TMDB_SEARCH_TITLES = 'TMDB_SEARCH_V3';

export const titleSearchPluginConfig = () => {
  const config: PluginLoaderConfigLUT = {
    ['example-uuid-1234']: {
      usePlugin: false,
      options: {
        apiKey: 'example-api-key2',
      },
      timeBetweenCallsMs: 1000,
    },
    [TMDB_SEARCH_TITLES]: {
      usePlugin: true,
      options: {
        apiKey: process.env['TMBD_API_KEY'] || '',
      },
      timeBetweenCallsMs: 50,
    },
  };

  return config;
};
