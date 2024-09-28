import { Logger } from '@nestjs/common';
import { ExternalTitleSearchRequest, ExternalTitleSearchResultCandidate } from '../external-providers.types';
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

  public async searchTitleByName(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultCandidate[]> {
    throw new Error('Method not implemented.');
  }
}
