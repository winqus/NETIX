import { Logger } from '@nestjs/common';
import { ExternalTitleSearchRequest, ExternalTitleSearchResultItem } from '../external-providers.types';
import { IExternalTitleProvider } from '../interfaces/external-title-provider.interface';
import { IExternalTitleSearcher } from '../interfaces/external-title-searcher.interface';

export class ProvidersExternalTitleSearcher implements IExternalTitleSearcher {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly externalProviders: IExternalTitleProvider[]) {
    if (!externalProviders || externalProviders.length === 0) {
      this.externalProviders = [];
      this.logger.warn('Initialized without any external providers.');
    }
  }

  public async searchTitleByName(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultItem[]> {
    try {
      let results: ExternalTitleSearchResultItem[] = [];
      for (const provider of this.externalProviders) {
        if (!provider.isEnabled()) {
          continue;
        }

        const result = await provider.search(request.query, { maxResults: request.maxResults, types: request.types });
        if (result && result.length > 0) {
          results = results.concat(...result);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Error searching for title ${request.query}`, error);
      throw error;
    }
  }
}
