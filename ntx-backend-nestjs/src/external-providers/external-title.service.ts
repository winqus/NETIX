import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import {
  DEFAULT_EXTERNAL_TITLE_SEARCH_MAX_RESULTS,
  EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN,
  EXTERNAL_TITLE_SEARCHER_TOKEN,
  EXTERNAL_TITLE_SELECTOR_TOKEN,
  ExternalProviders,
} from './external-providers.constants';
import {
  ExternalTitleMetadataRequest,
  ExternalTitleMetadataResult,
  ExternalTitleSearchRequest,
  ExternalTitleSearchResult,
} from './external-providers.types';
import { IExternalTitleMetadataService } from './external-title-metadata.service.interface';
import { IExternalTitleSearchService } from './external-title-search.service.interface';
import { IExternalTitleMetadataRetriever } from './interfaces/external-title-metadata-retriever.interface';
import { IExternalTitleSearcher } from './interfaces/external-title-searcher.interface';
import { IExternalTitleSelector } from './interfaces/external-title-selector.interface';

@Injectable()
export class ExternalTitleService implements IExternalTitleSearchService, IExternalTitleMetadataService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(EXTERNAL_TITLE_SEARCHER_TOKEN) private readonly searcher: IExternalTitleSearcher,
    @Inject(EXTERNAL_TITLE_SELECTOR_TOKEN) private readonly selector: IExternalTitleSelector,
    @Inject(EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN)
    private readonly metadataRetriever: IExternalTitleMetadataRetriever,
  ) {}

  public async search(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResult> {
    try {
      if (!request.query?.trim()) {
        throw new BadRequestException('Query is required');
      } else {
        request.query = request.query.trim();
      }

      if (!request.types || request.types.length === 0) {
        request.types = Object.values(TitleType);
      } else if (request.types.some((type) => !Object.values(TitleType).includes(type))) {
        throw new BadRequestException('Invalid type');
      }

      if (!request.providers || request.providers.length === 0) {
        request.providers = Object.values(ExternalProviders);
      }

      if (!request.maxResults || request.maxResults <= 0) {
        request.maxResults = DEFAULT_EXTERNAL_TITLE_SEARCH_MAX_RESULTS;
      }

      const candidates = await this.searcher.searchTitleByName(request);

      const selectedResults = await this.selector.select({
        candidates,
        searchedQuery: request.query,
      });

      return { size: selectedResults.length, results: selectedResults };
    } catch (error) {
      this.logger.error('Failed to search for title', error);
      throw error;
    }
  }

  public async getTitleMetadata<T extends TitleType>(
    request: ExternalTitleMetadataRequest<T>,
  ): Promise<ExternalTitleMetadataResult<T>> {
    try {
      if (!request.externalID?.trim()) {
        throw new BadRequestException('External ID is required');
      }

      if (!request.providerID?.trim()) {
        throw new BadRequestException('Provider ID is required');
      }

      if (!request.type || !Object.values(TitleType).includes(request.type)) {
        throw new BadRequestException('Type is required');
      }

      return this.metadataRetriever.getMetadata(request);
    } catch (error) {
      this.logger.error(`Failed to get metadata for title ${request.externalID} from ${request.providerID}`, error);
      throw error;
    }
  }
}
