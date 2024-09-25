export interface PluginConfig {
  usePlugin: boolean;
  options: {
    apiKey: string;
  };
  timeBetweenCallsMs: number;
}

export interface PluginConfigLUT {
  [key: string]: PluginConfig;
}
