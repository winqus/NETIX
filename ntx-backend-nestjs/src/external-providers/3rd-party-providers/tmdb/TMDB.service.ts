/*
  https://developer.themoviedb.org/docs/search-and-query-for-details
  https://developer.themoviedb.org/reference/search-movie
  https://developer.themoviedb.org/reference/search-tv
  https://developer.themoviedb.org/reference/movie-details
  https://developer.themoviedb.org/reference/tv-series-details
*/

const Fuse = require('fuse.js');
import { Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { normalize } from '@ntx/common/utils/mathUtils';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import {
  ExternalTitle,
  ExternalTitleMetadataRequest,
  ExternalTitleMetadataResult,
  ExternalTitleSearchResultCandidate,
} from '@ntx/external-providers/external-providers.types';
import { APIRateLimiter } from '@ntx/external-providers/implementations/api-rate-limiter.abstract';
import {
  ExternalProviderConfig,
  ExternalTitleSearchOptions,
  IExternalTitleProvider,
} from '@ntx/external-providers/interfaces/external-title-provider.interface';
import { FuseResult, FuseSortFunctionArg, IFuseOptions } from 'fuse.js';
import { TitleDetailedSearchResult } from '../../interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { ITitleSearchPlugin } from '../interfaces/ITitleSearchPlugin.interface';
import { TMDBMovieGateway } from './interfaces/TMDB-movie-gateway.interface';
import { TMDBTitleSelector } from './interfaces/TMDB-title-selector.interface';
import { TMDBTVShowGateway } from './interfaces/TMDB-tv-show-gateway.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBMovieGatewayAPIv3 } from './TMDB-movie-gateway-api-v3.class';
import { TMDBTitleSelectorFuseJS } from './TMDB-title-selector-fusejs.class';
import { TMDBTitleMapper } from './TMDB-title.mapper';
import { TMDBTVShowGatewayAPIv3 } from './TMDB-tv-show-gateway-api-v3.class';
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

export class TMDBService extends APIRateLimiter implements ITitleSearchPlugin, IExternalTitleProvider {
  private readonly config: TMDBConfig & ExternalProviderConfig;

  private readonly logger: Logger;

  readonly pluginUUID: string = ExternalProviders.TMDB.toString();

  private readonly tmdbMovieGateway: TMDBMovieGateway;
  private readonly tmdbTVShowGateway: TMDBTVShowGateway;
  private readonly tmdbTitleSelector: TMDBTitleSelector;

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

  constructor(setup: TMDBSetup, logger?: Logger) {
    super();
    this.config = defaultTMDBFactory(setup);
    this.initializeRateLimiter(this.config.rateLimitMs);

    this.logger = logger || new Logger(TMDBService.name);
    this.tmdbMovieGateway = new TMDBMovieGatewayAPIv3(this.config, this.logger);
    this.tmdbTVShowGateway = new TMDBTVShowGatewayAPIv3(this.config, this.logger);
    this.tmdbTitleSelector = new TMDBTitleSelectorFuseJS();
  }

  public getProviderID = (): string => ExternalProviders.TMDB.toString();

  public async exists(title: ExternalTitle): Promise<boolean> {
    const metadata = await this.getMetadata(title).catch((_error) => null);

    return metadata != null;
  }

  public async findByQuery(
    query: string,
    options?: ExternalTitleSearchOptions,
  ): Promise<ExternalTitleSearchResultCandidate[]> {
    throw new Error('Method not implemented.');
  }

  public async getMetadata<T extends TitleType>(
    request: ExternalTitleMetadataRequest<T>,
  ): Promise<ExternalTitleMetadataResult<T>> {
    throw new Error('Method not implemented.');
  }

  public async search(query: string, type?: TitleType, maxResults: number = 10): Promise<TitleSearchResult[]> {
    if (this.canCall() === false) {
      this.logger.warn(`Rate limit exceeded`);

      return [];
    }

    if (query == '' || query == null) {
      this.logger.error('Query is empty or null');

      return [];
    }

    this.updateLastCallTime();

    let tmdbTitles: TMDBTitle[] = [];

    switch (type) {
      case TitleType.MOVIE: {
        const apiMovieData = await this.tmdbMovieGateway.search({ title: query });
        tmdbTitles = tmdbTitles.concat(...(apiMovieData?.map((result) => result.results) || []));
        break;
      }
      case TitleType.SERIES: {
        const apiTVShowData = await this.tmdbTVShowGateway.search({ title: query });
        tmdbTitles = tmdbTitles.concat(...(apiTVShowData?.map((result) => result.results) || []));

        break;
      }
      default:
        const apiMovieData = await this.tmdbMovieGateway.search({ title: query });
        const apiTVShowData = await this.tmdbTVShowGateway.search({ title: query });

        tmdbTitles = tmdbTitles.concat(
          ...(apiMovieData?.map((result) => result.results) || []),
          ...(apiTVShowData?.map((result) => result.results) || []),
        );

        break;
    }

    const results = await this.tmdbTitleSelector.select({ query, candidates: tmdbTitles, maxResults });

    return results;
  }

  public async searchDetailsById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null> {
    if (this.canCall() === false) {
      this.logger.warn(`Rate limit exceeded (${this.getProviderID()})`);

      return null;
    }

    if (id == '' || id == null) {
      this.logger.error('ID is empty or null');

      return null;
    }

    this.updateLastCallTime();

    let titleDetails: TitleDetailedSearchResult | null = null;

    switch (type) {
      case TitleType.MOVIE:
        const tmdbMovieDetails = await this.tmdbMovieGateway.getDetailsByID(id);
        if (tmdbMovieDetails == null) {
          return null;
        }

        titleDetails = {
          id: tmdbMovieDetails.id.toString(),
          title: tmdbMovieDetails.title,
          originalTitle: tmdbMovieDetails.original_title,
          type: TitleType.MOVIE,
          releaseDate: tmdbMovieDetails.release_date,
          sourceUUID: this.getProviderID(),
          details: {
            runtime: tmdbMovieDetails.runtime,
          },
        };

        break;
      case TitleType.SERIES:
        const tmdbTVShowDetails = await this.tmdbTVShowGateway.getDetailsByID(id);
        if (tmdbTVShowDetails == null) {
          return null;
        }

        titleDetails = {
          id: tmdbTVShowDetails.id.toString(),
          title: tmdbTVShowDetails.name,
          originalTitle: tmdbTVShowDetails.original_name,
          type: TitleType.SERIES,
          releaseDate: tmdbTVShowDetails.first_air_date,
          sourceUUID: this.getProviderID(),
          details: {
            numberOfSeasons: tmdbTVShowDetails.number_of_seasons,
            numberOfEpisodes: tmdbTVShowDetails.number_of_episodes,
            seasons: tmdbTVShowDetails.seasons.map((season) => ({
              id: season.id.toString(),
              seasonNumber: season.season_number,
              releaseDate: season.air_date,
              episodeCount: season.episode_count,
              name: season.name,
            })) as any,
          },
        };

        break;
      default:
        this.logger.error('Unknown title type');

        break;
    }

    return titleDetails;
  }
}
