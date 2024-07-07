import { Controller, Get, Query } from '@nestjs/common';
import { titleSearchPluginConfig } from './constants';
import { TitleSearchPluginLoaderService } from './plugins/title-search-plugin-loader.service';

@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(
    private readonly titleSearchPluginLoaderService: TitleSearchPluginLoaderService,
  ) {
    const loadResult = this.titleSearchPluginLoaderService.loadPlugins(
      titleSearchPluginConfig(),
    );

    if (loadResult === false) {
      throw new Error('Failed to load title search plugins');
    }
  }

  @Get('title')
  async searchTitle(@Query('q') query: string) {
    const plugins = this.titleSearchPluginLoaderService.getPlugins();

    const searchResults = await Promise.all(
      plugins.map((plugin) => plugin.search(query)),
    );

    return searchResults.flat();
  }
}
