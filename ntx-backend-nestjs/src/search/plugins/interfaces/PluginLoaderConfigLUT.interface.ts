import { TitleSearchPluginConfig } from './ITitleSearchPlugin.interface';

export interface PluginLoaderConfigLUT {
  [plugin_uuid: string]: TitleSearchPluginConfig;
}
