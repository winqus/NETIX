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
import { APIRateLimiter } from '@ntx/external-providers/implementations/api-rate-limiter.abstract';
import { ExternalProviderConfig } from '@ntx/external-providers/interfaces/external-title-provider.interface';
import { FuseResult, FuseSortFunctionArg, IFuseOptions } from 'fuse.js';
import { TitleDetailedSearchResult } from '../../interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { ITitleSearchPlugin } from '../interfaces/ITitleSearchPlugin.interface';
import { TMDBMovieGateway } from './interfaces/TMDB-movie-gateway.interface';
import { TMDBTVShowGateway } from './interfaces/TMDB-tv-show-gateway.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBMovieGatewayAPIv3 } from './TMDB-movie-gateway-api-v3.class';
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

export class TMDBService extends APIRateLimiter implements ITitleSearchPlugin {
  private readonly config: TMDBConfig & ExternalProviderConfig;

  private readonly logger: Logger;

  private readonly tmdbMovieGateway: TMDBMovieGateway;
  private readonly tmdbTVShowGateway: TMDBTVShowGateway;

  public readonly pluginUUID = ExternalProviders.TMDB;

  private apiKey: string;

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

    if (tmdbTitles.length === 0) {
      return [];
    } else if (tmdbTitles.length === 1) {
      const title = this.mapTMDBTitleToTitleSearchResult(tmdbTitles[0]);
      title.weight = 1.0;

      return [title];
    } else if (tmdbTitles.length <= 5) {
      tmdbTitles = this.normalizeTMDBTitlesPopularity(tmdbTitles);

      const titleSearchResults: TitleSearchResult[] = tmdbTitles
        .map((title) => this.mapTMDBTitleToTitleSearchResult(title))
        .sort((a, b) => b.weight - a.weight);

      const fuzeResults = this.filterResultsWithFuse(query, titleSearchResults);

      const combinedResults: TitleSearchResult[] = [
        ...fuzeResults.map((result) => {
          return { ...result.item, score: result.score };
        }),
      ];

      const fuzzySearchResultIds = new Set(fuzeResults.map((result) => result.item.id));
      for (const titleResult of titleSearchResults) {
        if (fuzzySearchResultIds.has(titleResult.id) === false) {
          combinedResults.push(titleResult);
        }
      }

      combinedResults.forEach((result) => {
        const TMDB_WEIGHT = 0.3;
        const FUZEJS_WEIGHT = 1 - TMDB_WEIGHT;

        let score = 0.0;
        if ('score' in result) {
          score = (result as any).score!;
        }

        result.weight = parseFloat((result.weight * TMDB_WEIGHT + score * FUZEJS_WEIGHT).toFixed(3));
      });

      return combinedResults.slice(0, maxResults).sort((a, b) => b.weight - a.weight);
    }

    tmdbTitles.sort((a, b) => {
      return b.popularity - a.popularity;
    });

    if (tmdbTitles.length > 10) {
      tmdbTitles = tmdbTitles.filter((title) => title.popularity > 10.0);
    }

    let normalizedTitles: TMDBTitle[] = this.normalizeTMDBTitlesPopularity(tmdbTitles);
    if (normalizedTitles.length > 10) {
      normalizedTitles = normalizedTitles.filter((title) => title.popularity > 0.03);
    }

    const titleSearchResults: TitleSearchResult[] = normalizedTitles.map((title) =>
      this.mapTMDBTitleToTitleSearchResult(title),
    );

    const fuzzySearchResults: FuseResult<TitleSearchResult>[] = this.filterResultsWithFuse(query, titleSearchResults);

    const TMDB_WEIGHT = 0.0;
    const FUZEJS_WEIGHT = 1 - TMDB_WEIGHT;
    const simpleAdditiveWeightingResults: TitleSearchResult[] = fuzzySearchResults.map((result) => {
      (result as any).item.originalWeight = result.item.weight; // Save original weight for debugging
      result.item.weight = parseFloat((result.item.weight * TMDB_WEIGHT + result.score! * FUZEJS_WEIGHT).toFixed(3));

      return result.item;
    });

    if (TMDB_WEIGHT > 0.0) {
      simpleAdditiveWeightingResults.sort((a, b) => b.weight - a.weight);
    }

    return simpleAdditiveWeightingResults.slice(0, maxResults).map((result) => {
      return {
        id: result.id,
        title: result.title,
        originalTitle: result.originalTitle,
        type: result.type,
        weight: result.weight,
        // originalWeight: result.originalWeight, // For debugging
        releaseDate: result.releaseDate,
        sourceUUID: this.pluginUUID,
      };
    });
  }

  public async searchDetailsById(id: string, type: TitleType): Promise<TitleDetailedSearchResult | null> {
    if (this.canCall() === false) {
      this.logger.warn(`Rate limit exceeded (${this.pluginUUID})`);

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
          sourceUUID: this.pluginUUID,
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
          sourceUUID: this.pluginUUID,
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

  private normalizeTMDBTitlesPopularity(titles: TMDBTitle[]): TMDBTitle[] {
    if (titles.length === 0) {
      return [];
    }

    const sortedByPopularityDesc = Array.from(titles).sort((a, b) => {
      return b.popularity - a.popularity;
    });

    const normalizedPopularity = normalize(
      sortedByPopularityDesc.map((title) => title.popularity),
      true,
      sortedByPopularityDesc[sortedByPopularityDesc.length - 1].popularity,
      sortedByPopularityDesc[0].popularity,
    );

    sortedByPopularityDesc.forEach((movie, index) => {
      movie.popularity = normalizedPopularity[index];
    });

    return sortedByPopularityDesc;
  }

  private filterResultsWithFuse(query: string, results: TitleSearchResult[]): FuseResult<TitleSearchResult>[] {
    const fuse = new Fuse(results, this.fuseOptions);
    const fuseResults = fuse.search(query);
    fuseResults.forEach((result: FuseSortFunctionArg) => {
      result.score = 1.0 - result.score; // Invert score to be more intuitive for our use case
    });

    return fuseResults;
  }

  private mapTMDBTitleToTitleSearchResult(title: TMDBTitle): TitleSearchResult {
    let type = TitleType.MOVIE;
    if ('first_air_date' in title) {
      type = TitleType.SERIES;
    }

    let result: TitleSearchResult = {} as any;

    switch (type) {
      case TitleType.MOVIE:
        title = title as TMDBMovie;
        result = {
          id: title.id.toString(),
          title: title.title,
          originalTitle: title.original_title,
          type: type,
          weight: parseFloat(title.popularity.toFixed(3)),
          releaseDate: title.release_date,
          sourceUUID: this.pluginUUID,
        };

        break;
      case TitleType.SERIES:
        title = title as TMDBTVShow;
        result = {
          id: title.id.toString(),
          title: title.name,
          originalTitle: title.original_name,
          type: type,
          weight: parseFloat(title.popularity.toFixed(3)),
          releaseDate: title.first_air_date,
          sourceUUID: this.pluginUUID,
        };
        break;
      default:
        this.logger.error('Unknown title type');

        break;
    }

    return result;
  }
}
