import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ITitleSearchPlugin,
  PluginLoaderConfigLUT,
} from './interfaces/ITitleSearchPlugin.interface';

@Injectable()
export class TitleSearchPluginLoaderService {
  private readonly logger = new Logger(TitleSearchPluginLoaderService.name);

  private plugins: ITitleSearchPlugin[] = [];

  loadPlugins(config_lut: PluginLoaderConfigLUT): boolean {
    let loadResult = true;

    const pluginDir = path.join(__dirname, 'title-search-implementations');
    fs.readdirSync(pluginDir).forEach((file) => {
      if (file.endsWith('.plugin.js') || file.endsWith('.plugin.ts')) {
        const pluginPath = path.join(pluginDir, file);
        const PluginClass = require(pluginPath).default;

        if (typeof PluginClass !== 'function') {
          this.logger.error(
            `Plugin file (${file}) does not export a class that implements ITitleSearchPlugin`,
          );

          return;
        }

        const pluginInstance: ITitleSearchPlugin = new PluginClass();

        const config = config_lut[pluginInstance.pluginUUID];
        const initResult = pluginInstance.init(config);

        if (initResult === true) {
          this.plugins.push(pluginInstance);
        } else {
          loadResult = false;

          // console.error(
          //   `Failed to initialize plugin (${pluginInstance.pluginUUID})`,
          // );
          this.logger.error(
            `Failed to initialize plugin (${pluginInstance.pluginUUID})`,
          );
        }
      }
    });

    // console.log(`Title search plugins (${this.plugins.length}) loaded`);
    this.logger.log(`Title search plugins (${this.plugins.length}) loaded`);

    return loadResult;
  }

  getPlugins(): ITitleSearchPlugin[] {
    return this.plugins;
  }
}
