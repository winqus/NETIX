/*
  https://developer.themoviedb.org/docs/search-and-query-for-details
  https://developer.themoviedb.org/reference/search-movie
  https://developer.themoviedb.org/reference/search-tv
  https://developer.themoviedb.org/reference/movie-details
  https://developer.themoviedb.org/reference/tv-series-details
*/

const Fuse = require('fuse.js');
import { Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { normalize } from '@ntx/common/utils/mathUtils';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { FuseResult, FuseSortFunctionArg, IFuseOptions } from 'fuse.js';
import AbstractAPIPlugin from '../../interfaces/AbstractAPIPlugin';
import { TitleDetailedSearchResult } from '../../interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { ITitleSearchPlugin, TitleSearchPluginConfig } from '../interfaces/ITitleSearchPlugin.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBMovieDetails } from './interfaces/TMDBMovieDetails';
import { TMDBSearchResult } from './interfaces/TMDBSearchResult';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBTVShowDetails } from './interfaces/TMDBTVShowDetails';
import { TMDBTitle } from './interfaces/TMDBTitle';

@Injectable()
export class TMDBSearchTitleService extends AbstractAPIPlugin implements ITitleSearchPlugin {
  private readonly logger = new Logger(this.constructor.name);

  public readonly pluginUUID = ExternalProviders.TMDB_SEARCH_V3;

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

  constructor() {
    super();
  }

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

  public async search(query: string, type?: TitleType, maxResults: number = 10): Promise<TitleSearchResult[]> {
    if (this.canCall() === false) {
      this.logger.warn(`Rate limit exceeded (${this.pluginUUID})`);

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
        const apiMovieData = await this.searchMovieAPI(query);
        tmdbTitles = tmdbTitles.concat(...(apiMovieData?.map((result) => result.results) || []));
        break;
      }
      case TitleType.SERIES: {
        const apiTVShowData = await this.searchTVShowAPI(query);
        tmdbTitles = tmdbTitles.concat(...(apiTVShowData?.map((result) => result.results) || []));

        break;
      }
      default:
        const apiMovieData = await this.searchMovieAPI(query);
        const apiTVShowData = await this.searchTVShowAPI(query);

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
        titleDetails = await this.getMovieDetailsByIdAPI(id);

        break;
      case TitleType.SERIES:
        titleDetails = await this.getTVShowDetailsByIdAPI(id);

        break;
      default:
        this.logger.error('Unknown title type');

        break;
    }

    return titleDetails;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async searchMovieAPI(
    title: string,
    year?: string,
    language = 'en-US',
  ): Promise<TMDBSearchResult<TMDBMovie>[] | null> {
    if (title == '' || title == null) {
      this.logger.error('movie title is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBMovie>[] = [];
    let currentPage = 1;
    let totalPages = 1;
    const maxPages = 5;

    while (currentPage <= totalPages && currentPage <= maxPages) {
      const params = new URLSearchParams();
      params.append('query', encodeURIComponent(title));
      params.append('include_adult', 'false');
      params.append('language', language);
      params.append('page', currentPage.toString());
      if (year != null) {
        params.append('year', year || '');
      }

      const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      };

      const response = await fetch(url, options);
      if (response.ok === false) {
        this.logger.error(`Failed to fetch movie data from TMDB API: ${response.statusText}`);

        return null;
      }

      const data: TMDBSearchResult<TMDBMovie> = await response.json();
      if (data == null || 'results' in data === false) {
        this.logger.error('No movie results in data from TMDB API');

        return null;
      }

      if (data.results.length === 0) {
        break;
      }

      const filteredResults = data.results.filter(
        (movie) => 'popularity' in movie && 'release_date' in movie && movie.release_date.length > 0,
      );

      allResults.push({
        page: data.page,
        results: filteredResults,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });

      totalPages = data.total_pages;
      currentPage++;
      await this.delay(10);
    }

    return allResults.length > 0 ? allResults : null;
  }

  private async searchTVShowAPI(
    title: string,
    year?: string,
    language = 'en-US',
  ): Promise<TMDBSearchResult<TMDBTVShow>[] | null> {
    if (title == '' || title == null) {
      this.logger.error('TV show title is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBTVShow>[] = [];
    let currentPage = 1;
    let totalPages = 1;
    const maxPages = 5;

    while (currentPage <= totalPages && currentPage <= maxPages) {
      const params = new URLSearchParams();
      params.append('query', encodeURIComponent(title));
      params.append('include_adult', 'false');
      params.append('language', language);
      params.append('page', currentPage.toString());
      if (year != null) {
        params.append('first_air_date_year', year || '');
      }

      const url = `https://api.themoviedb.org/3/search/tv?${params.toString()}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      };

      const response = await fetch(url, options);
      if (response.ok === false) {
        this.logger.error(`Failed to fetch TV show data from TMDB API: ${response.statusText}`);

        return null;
      }

      const data: TMDBSearchResult<TMDBTVShow> = await response.json();
      if (data == null || 'results' in data === false) {
        this.logger.error('No TV show results in data from TMDB API');

        return null;
      }

      if (data.results.length === 0) {
        break;
      }

      const filteredResults = data.results.filter(
        (tv_show) => 'popularity' in tv_show && 'first_air_date' in tv_show && tv_show.first_air_date.length > 0,
      );

      allResults.push({
        page: data.page,
        results: filteredResults,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });

      totalPages = data.total_pages;
      currentPage++;
      await this.delay(10);
    }

    return allResults.length > 0 ? allResults : null;
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

  private async getMovieDetailsByIdAPI(movie_id: string): Promise<TitleDetailedSearchResult | null> {
    if (movie_id == '' || movie_id == null) {
      this.logger.error('movie_id is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('language', 'en-US');

    const url = `https://api.themoviedb.org/3/movie/${movie_id}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    const response = await fetch(url, options);
    if (response.ok === false) {
      this.logger.error(`Failed to fetch movie data from TMDB API: ${response.statusText}`);

      return null;
    }

    const data: TMDBMovieDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No movie results in data from TMDB API');

      return null;
    }

    return {
      id: data.id.toString(),
      title: data.title,
      originalTitle: data.original_title,
      type: TitleType.MOVIE,
      releaseDate: data.release_date,
      sourceUUID: this.pluginUUID,
      details: {
        runtime: data.runtime,
      },
    };
  }

  private async getTVShowDetailsByIdAPI(series_id: string): Promise<TitleDetailedSearchResult | null> {
    if (series_id == '' || series_id == null) {
      this.logger.error('series_id is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('language', 'en-US');

    const url = `https://api.themoviedb.org/3/tv/${series_id}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    const response = await fetch(url, options);
    if (response.ok === false) {
      this.logger.error(`Failed to fetch movie data from TMDB API: ${response.statusText}`);

      return null;
    }

    const data: TMDBTVShowDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No movie results in data from TMDB API');

      return null;
    }

    return {
      id: data.id.toString(),
      title: data.name,
      originalTitle: data.original_name,
      type: TitleType.SERIES,
      releaseDate: data.first_air_date,
      sourceUUID: this.pluginUUID,
      details: {
        numberOfSeasons: data['number_of_seasons'],
        numberOfEpisodes: data['number_of_episodes'],
        seasons: data.seasons.map((season) => ({
          id: season.id.toString(),
          seasonNumber: season.season_number,
          releaseDate: season.air_date,
          episodeCount: season.episode_count,
          name: season.name,
        })) as any,
      },
    };
  }
}
