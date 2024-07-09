import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SYSTEM_SEARCH_TITLES, titleSearchPluginConfig } from './constants';
import { TitleType } from './interfaces/TitleType.enum';
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

    return searchResults.flat().sort((a, b) => b.weight - a.weight);
  }

  @Get('title/:id')
  async searchDetails(
    @Param('id') id: string,
    @Query('type') type: TitleType,
    @Query('source') source?: string,
  ) {
    if (id == null || id === '') {
      throw new HttpException('ID is required', HttpStatus.BAD_REQUEST);
    }

    if (type !== TitleType.MOVIE && type !== TitleType.SERIES) {
      throw new HttpException(
        'Invalid type. Type must be either MOVIE or SERIES',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (source == null || source === '') {
      source = SYSTEM_SEARCH_TITLES;
    }

    const plugins = this.titleSearchPluginLoaderService
      .getPlugins()
      .filter((plugin) => plugin.pluginUUID === source);

    if (plugins.length === 0) {
      throw new HttpException(
        'Search source not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (plugins.length !== 1) {
      throw new HttpException(
        'Multiple search sources found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await plugins[0].searchById(id, type);

    if (!result) {
      throw new HttpException('No results found', HttpStatus.NOT_FOUND);
    }

    return result;
  }
}
