import { PluginLoaderConfigLUT } from './plugins/interfaces/ITitleSearchPlugin.interface';

export const TMBD_SEARCH_TITLES = 'TMBD_SEARCH_V3';

export const titleSearchPluginConfig = () => {
  const config: PluginLoaderConfigLUT = {
    ['example-uuid-1234']: {
      usePlugin: false,
      options: {
        apiKey: 'example-api-key2',
      },
      timeBetweenCallsMs: 25,
    },
    [TMBD_SEARCH_TITLES]: {
      usePlugin: true,
      options: {
        apiKey: process.env['TMBD_API_KEY'] || '',
      },
      timeBetweenCallsMs: 1000,
    },
  };

  return config;
};
