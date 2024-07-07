import AbstractTitleSearchPlugin from '../AbstractTitleSearchPlugin';
import {
  ITitleSearchPlugin,
  TitleSearchPluginConfig,
  TitleSearchResult,
} from '../interfaces/ITitleSearchPlugin.interface';

export default class ExampleTitleSearchPlugin
  extends AbstractTitleSearchPlugin
  implements ITitleSearchPlugin
{
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
      throw new Error(
        'Time between calls was not provided for ExampleTitleSearchPlugin',
      );
    }

    return true;
  }

  public async search(query: string): Promise<TitleSearchResult[]> {
    if (this.canCall() === false) {
      console.log(`Rate limit exceeded (${this.pluginUUID})`);

      return [];
    }

    if (query == '' || query == null) {
      console.log('Query is empty or null');

      return [];
    }

    this.updateLastCallTime();

    return [
      {
        title: 'Example Title (2018)',
        originalTitle: 'Example Title',
        id: 'example-id-1234',
        type: 'MOVIE',
        weight: 0.8,
        releaseDate: '2018-06-14',
        sourceUUID: this.pluginUUID,
      },
    ];
  }
}
