import { TitleDetailedSearchResult } from 'src/search/interfaces/TitleDetailedSearchResult.interface';
import AbstractTitleSearchPlugin from '../../../common/AbstractAPIPlugin';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { TitleType } from '../../interfaces/TitleType.enum';
import { ITitleSearchPlugin, TitleSearchPluginConfig } from '../interfaces/ITitleSearchPlugin.interface';

export default class ExampleTitleSearchPlugin extends AbstractTitleSearchPlugin implements ITitleSearchPlugin {
  public readonly pluginUUID = 'example-uuid-1234';

  private apiKey: string;

  public init(config: TitleSearchPluginConfig): boolean {
    if ('apiKey' in config.options && config.options.apiKey.length > 1) {
      this.apiKey = config.options.apiKey;
    } else {
      throw new Error('API key not provided for ExampleTitleSearchPlugin');
    }

    if ('timeBetweenCallsMs' in config) {
      this.timeBetweenCallsMs = config.timeBetweenCallsMs;
    } else {
      throw new Error('Time between calls was not provided for ExampleTitleSearchPlugin');
    }

    return true;
  }

  public async search(query: string): Promise<TitleSearchResult[]> {
    if (this.canCall() === false) {
      this.logger.log(`Rate limit exceeded (${this.pluginUUID})`);

      return [];
    }

    if (query == '' || query == null) {
      this.logger.log('Query is empty or null');

      return [];
    }

    this.updateLastCallTime();

    return [
      {
        title: 'Example Title (2018)',
        originalTitle: 'Example Title',
        id: 'example-id-1234',
        type: TitleType.MOVIE,
        weight: 0.8,
        releaseDate: '2018-06-14',
        sourceUUID: this.pluginUUID,
      },
    ];
  }

  public async searchById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null> {
    if (this.canCall() === false) {
      this.logger.log(`Rate limit exceeded (${this.pluginUUID})`);

      return null;
    }

    if (id == '' || id == null) {
      this.logger.log('ID is empty or null');

      return null;
    }

    this.updateLastCallTime();

    return {
      title: 'Example Title (2018)',
      originalTitle: 'Example Title',
      id: 'example-id-1234',
      type: type,
      releaseDate: '2018-06-14',
      sourceUUID: this.pluginUUID,
      details: {
        runtime: 120,
      },
    };
  }
}
