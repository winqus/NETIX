/*
  https://developer.themoviedb.org/docs/search-and-query-for-details
  https://developer.themoviedb.org/reference/search-movie
  https://developer.themoviedb.org/reference/search-tv
  https://developer.themoviedb.org/reference/movie-details
  https://developer.themoviedb.org/reference/tv-series-details
*/

import { Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { delayByMs } from '@ntx/common/utils/delay.utils';
import {
  DEFAULT_EXTERNAL_TITLE_SEARCH_MAX_RESULTS,
  ExternalProviders,
} from '@ntx/external-providers/external-providers.constants';
import {
  ExternalTitle,
  ExternalTitleMetadataResult,
  ExternalTitleSearchResultItem,
} from '@ntx/external-providers/external-providers.types';
import { APIRateLimiter, ApplyCallRateLimit } from '@ntx/external-providers/implementations/api-rate-limiter.abstract';
import {
  ExternalProviderConfig,
  ExternalTitleSearchOptions,
  IExternalTitleProvider,
} from '@ntx/external-providers/interfaces/external-title-provider.interface';
import { IFuseOptions } from 'fuse.js';
import { TMDBMovieGateway } from './interfaces/TMDB-movie-gateway.interface';
import { TMDBTitleSelector } from './interfaces/TMDB-title-selector.interface';
import { TMDBTVShowGateway } from './interfaces/TMDB-tv-show-gateway.interface';
import { TMDBTitle } from './interfaces/TMDBTitle';
import { TMDBImagePathToOriginalImageURL, TMDBTitleMapper } from './TMDB-title.mapper';
import { defaultTMDBFactory } from './TMDB.factory';

export type TMDBSetup = {
  enable?: boolean;
  apiKey: string;
  rateLimitMs?: number;
};

export interface TMDBConfig {
  apiKey: string;
  rateLimitMs: number;
}

export class TMDBService extends APIRateLimiter implements IExternalTitleProvider {
  private readonly config: TMDBConfig & ExternalProviderConfig;

  private readonly tmdbMovieGateway: TMDBMovieGateway;
  private readonly tmdbTVShowGateway: TMDBTVShowGateway;
  private readonly tmdbTitleSelector: TMDBTitleSelector;
  private readonly logger: Logger;

  fuseOptions: IFuseOptions<any> = {
    findAllMatches: true,
    keys: ['title', 'originalTitle'],
    threshold: 0.6,
    distance: 30,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 1,
    ignoreFieldNorm: false, // Can improve matching, or not...
  };

  constructor(
    setup: TMDBSetup,
    movieGateway: TMDBMovieGateway,
    tvShowGateway: TMDBTVShowGateway,
    titleSelector: TMDBTitleSelector,
    logger?: Logger,
  ) {
    super();
    this.config = defaultTMDBFactory(setup);
    this.initializeRateLimiter(this.config.rateLimitMs);

    this.tmdbMovieGateway = movieGateway;
    this.tmdbTVShowGateway = tvShowGateway;
    this.tmdbTitleSelector = titleSelector;

    this.logger = logger || new Logger(TMDBService.name);
  }

  public getProviderID = (): string => ExternalProviders.TMDB.toString();

  public isEnabled = (): boolean => this.config.enabled;

  public async exists(title: ExternalTitle): Promise<boolean> {
    const metadata = await this.getMetadata(title.externalID, title.type).catch((_error) => null);

    return metadata != null;
  }

  @ApplyCallRateLimit({ returnValueOnRateLimit: null })
  public async getMetadata<T extends TitleType>(
    externalID: string,
    type: T,
  ): Promise<ExternalTitleMetadataResult<T> | null> {
    if (this.isValidTitleType(type) === false) {
      this.logger.error(`Unknown title type: ${type}`);

      return null;
    }

    if (this.isEnabled() === false) {
      this.logger.error('Service is not enabled');

      return null;
    }

    const typeToSearchStrategyMap = {
      [TitleType.MOVIE]: (ID: string) => this.tmdbMovieGateway.getDetailsByID(ID),
      [TitleType.SERIES]: (ID: string) => this.tmdbTVShowGateway.getDetailsByID(ID),
    };

    const titleDetails = await typeToSearchStrategyMap[type](externalID);
    if (titleDetails == null) {
      return null;
    }

    const metadata = TMDBTitleMapper.TMDBTitleDetails2ExternalTitleMetadata(titleDetails);

    return {
      providerID: this.getProviderID(),
      externalID: externalID,
      type: type,
      metadata: metadata,
      posterURL: TMDBImagePathToOriginalImageURL(titleDetails.poster_path),
      backdropURL: TMDBImagePathToOriginalImageURL(titleDetails.backdrop_path),
    } as ExternalTitleMetadataResult<T>;
  }

  @ApplyCallRateLimit({ returnValueOnRateLimit: [] })
  public async search(query: string, options?: ExternalTitleSearchOptions): Promise<ExternalTitleSearchResultItem[]> {
    if (query == '' || query == null) {
      this.logger.error('Query is empty or null');

      return [];
    }

    if (this.isEnabled() === false) {
      this.logger.error('Service is not enabled');

      return [];
    }

    let { types, maxResults } = options || {};

    if (!types || types.length === 0) {
      types = Object.values(TitleType);
    } else {
    }

    types.forEach((type) => {
      if (this.isValidTitleType(type) === false) {
        this.logger.error(`Unknown title type: ${type}`);

        return [];
      }
    });

    if (!maxResults || maxResults <= 0) {
      maxResults = DEFAULT_EXTERNAL_TITLE_SEARCH_MAX_RESULTS;
    }

    const typeToSearchStrategyMap = {
      [TitleType.MOVIE]: (args: { query: string }) => this.tmdbMovieGateway.search(args),
      [TitleType.SERIES]: (args: { query: string }) => this.tmdbTVShowGateway.search(args),
    };

    let tmdbTitles: TMDBTitle[] = [];

    for (const type of types) {
      const apiData = await typeToSearchStrategyMap[type]({ query });
      if (apiData != null) {
        tmdbTitles = tmdbTitles.concat(...(apiData.map((result) => result.results) || []));
        await delayByMs(this.config.rateLimitMs);
      }
    }

    const results = await this.tmdbTitleSelector.select({ query, candidates: tmdbTitles, maxResults });

    return results.map((title) => TMDBTitleMapper.TMDBTitle2ExternalTitleSearchResultItem(title));
  }

  private isValidTitleType = (type: TitleType): boolean => {
    return Object.values(TitleType).includes(type);
  };
}
