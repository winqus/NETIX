import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@ntx/common/Result';
import { ExternalSearchSources, getConfigForSource } from './external-search.constants';
import { TitleDetailedSearchResult } from './interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from './interfaces/TitleSearchResult.interface';
import { TitleType } from './interfaces/TitleType.enum';
import { TMDBSearchTitleService } from './plugins/tmdb-search-title/TMDB-search-title.service';

@Injectable()
export class ExternalTitleSearchService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly tmdbSearchService: TMDBSearchTitleService) {
    if (tmdbSearchService.init(getConfigForSource(ExternalSearchSources.TMDB_SEARCH_V3)!) === false) {
      this.logger.error('Failed to initialize TMDB search service');

      throw new Error('Failed to initialize TMDB search service');
    }
  }

  async searchByQuery(query: string, type?: TitleType, maxResults: number = 10): Promise<Result<TitleSearchResult[]>> {
    try {
      if (query == null || query === '') {
        this.logger.warn('Query is required');

        return Result.fail('Query is required');
      }

      if (maxResults < 1) {
        this.logger.warn('Max results must be greater than 0');

        return Result.fail('Max results must be greater than 0');
      }

      const titles = await this.tmdbSearchService.search(query, type, maxResults);

      return Result.ok(titles);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  async searchDetailsByTitleId(
    id: string,
    type: TitleType,
    sourceUUID = ExternalSearchSources.TMDB_SEARCH_V3,
  ): Promise<Result<TitleDetailedSearchResult>> {
    try {
      if (id == null || id === '') {
        this.logger.warn('ID is required');

        return Result.fail('ID is required');
      }

      if (Object.values(TitleType).includes(type) === false) {
        this.logger.warn(`Invalid type (${type}). Type must be one of: ${Object.values(TitleType).join(', ')}`);

        return Result.fail(`Invalid type. Type must be one of: ${Object.values(TitleType).join(', ')}`);
      }

      let titleDetails = null;

      switch (sourceUUID) {
        case ExternalSearchSources.TMDB_SEARCH_V3:
          titleDetails = await this.tmdbSearchService.searchDetailsById(id, type);
          break;
        default:
          this.logger.warn(`Invalid source (${sourceUUID})`);

          return Result.fail('Invalid source');
      }

      if (titleDetails == null) {
        this.logger.warn('No results found');

        return Result.fail('No results found');
      }

      return Result.ok(titleDetails);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
