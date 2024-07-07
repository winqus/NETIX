import { PluginLoaderConfigLUT } from './plugins/interfaces/ITitleSearchPlugin.interface';

export const titleSearchPluginConfig = () => {
  const config: PluginLoaderConfigLUT = {
    'example-uuid-1234': {
      usePlugin: true,
      options: {
        apiKey: process.env['TMBD_API_KEY'] || '',
      },
      timeBetweenCallsMs: 25,
    },
    'example-uuid-2': {
      usePlugin: true,
      options: {
        apiKey: 'example-api-key2',
      },
      timeBetweenCallsMs: 1000,
    },
  };

  return config;
};
