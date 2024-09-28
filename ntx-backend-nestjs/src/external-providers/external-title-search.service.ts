import { Inject, Injectable, Logger } from '@nestjs/common';
import { EXTERNAL_TITLE_SEARCHER_TOKEN, EXTERNAL_TITLE_SELECTOR_TOKEN } from './external-providers.constants';
import {
  ExternalTitleSearchRequest,
  ExternalTitleSearchResult,
  ExternalTitleSearchResultDTO,
} from './external-providers.types';
import { IExternalTitleSearchService } from './external-title-search.service.interface';
import { IExternalTitleSearcher } from './interfaces/external-title-searcher.interface';
import { IExternalTitleSelector } from './interfaces/external-title-selector.interface';

@Injectable()
export class ExternalTitleService implements IExternalTitleSearchService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(EXTERNAL_TITLE_SEARCHER_TOKEN) private readonly searcher: IExternalTitleSearcher,
    @Inject(EXTERNAL_TITLE_SELECTOR_TOKEN) private readonly selector: IExternalTitleSelector,
  ) {}

  public async search(request: ExternalTitleSearchRequest): Promise<ExternalTitleSearchResultDTO> {
    const candidates = await this.searcher.searchTitleByName(request);

    const selectedResults = await this.selector.select({
      candidates,
      searchedQuery: request.query,
    });

    return { size: selectedResults.length, results: selectedResults };
  }
}
