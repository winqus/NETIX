/*
  https://developer.themoviedb.org/docs/search-and-query-for-details
  https://developer.themoviedb.org/reference/search-movie
  https://developer.themoviedb.org/reference/search-tv
  https://developer.themoviedb.org/reference/movie-details
  https://developer.themoviedb.org/reference/tv-series-details
*/

import AbstractTitleSearchPlugin from '../../../common/AbstractAPIPlugin';
import { TMDB_SEARCH_TITLES } from '../../constants';
import { TitleDetailedSearchResult } from '../../interfaces/TitleDetailedSearchResult.interface';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { TitleType } from '../../interfaces/TitleType.enum';
import {
  ITitleSearchPlugin,
  TitleSearchPluginConfig,
} from '../interfaces/ITitleSearchPlugin.interface';

interface TMDBSearchResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBTVShow {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

interface TMDBMovie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TMDBMovieDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  };
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TMDBTVShowDetails {
  adult: boolean;
  backdrop_path: string;
  created_by: any[];
  episode_run_time: number[];
  first_air_date: string;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
  };
  name: string;
  next_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  };
  networks: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

type TMDBTitle = TMDBMovie | TMDBTVShow;

export default class TMBDSearchTitlePlugin
  extends AbstractTitleSearchPlugin
  implements ITitleSearchPlugin
{
  public readonly pluginUUID = TMDB_SEARCH_TITLES;

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
      this.logger.warn(`Rate limit exceeded (${this.pluginUUID})`);

      return [];
    }

    if (query == '' || query == null) {
      this.logger.error('Query is empty or null');

      return [];
    }

    this.updateLastCallTime();

    const apiMovieData = await this.searchMovieAPI(query);

    const apiTVShowData = await this.searchTVShowAPI(query);

    const mergedTitles = ([] as TMDBTitle[]).concat(
      apiMovieData?.results || [],
      apiTVShowData?.results || [],
    );

    const filteredTitles = this.normalizeAndfilterTMDBTitles(mergedTitles);

    const searchResults: TitleSearchResult[] = filteredTitles.map((title) =>
      this.mapTMDBTitleToTitleSearchResult(title),
    );

    return searchResults;
  }

  public async searchById(
    id: string,
    type: TitleType,
  ): Promise<TitleDetailedSearchResult | null> {
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

  private async searchMovieAPI(
    title: string,
    year?: string,
    language = 'en-US',
    page = 1,
  ): Promise<TMDBSearchResult<TMDBMovie> | null> {
    if (title == '' || title == null) {
      this.logger.error('movie title is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('query', encodeURIComponent(title));
    params.append('include_adult', 'false');
    params.append('language', language);
    params.append('page', page.toString());
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
      this.logger.error(
        `Failed to fetch movie data from TMBD API: ${response.statusText}`,
      );

      return null;
    }

    const data: TMDBSearchResult<TMDBMovie> = await response.json();
    if (data == null || 'results' in data === false) {
      this.logger.error('No movie results in data from TMBD API');

      return null;
    }

    if (data.results.length === 0) {
      return null;
    }

    let popularityThreshold = 1.0;
    if (data.results.length > 3) {
      popularityThreshold = 5.0;
    }

    const filteredResults = data.results.filter(
      (movie) =>
        'popularity' in movie &&
        movie.popularity > popularityThreshold &&
        'release_date' in movie &&
        movie.release_date.length > 0,
    );

    return {
      page: data.page,
      results: filteredResults,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  }

  private async searchTVShowAPI(
    title: string,
    year?: string,
    language = 'en-US',
    page = 1,
  ): Promise<TMDBSearchResult<TMDBTVShow> | null> {
    if (title == '' || title == null) {
      this.logger.error('TV show title is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('query', encodeURIComponent(title));
    params.append('include_adult', 'false');
    params.append('language', language);
    params.append('page', page.toString());
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
      this.logger.error(
        `Failed to fetch TV show data from TMBD API: ${response.statusText}`,
      );

      return null;
    }

    const data: TMDBSearchResult<TMDBTVShow> = await response.json();
    if (data == null || 'results' in data === false) {
      this.logger.error('No TV show results in data from TMBD API');

      return null;
    }

    if (data.results.length === 0) {
      return null;
    }

    let popularityThreshold = 1.0;
    if (data.results.length > 3) {
      popularityThreshold = 5.0;
    }

    const filteredResults = data.results.filter(
      (tv_show) =>
        'popularity' in tv_show &&
        tv_show.popularity > popularityThreshold &&
        'first_air_date' in tv_show &&
        tv_show.first_air_date.length > 0,
    );

    return {
      page: data.page,
      results: filteredResults,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  }

  private normalizeAndfilterTMDBTitles(titles: TMDBTitle[]): TMDBTitle[] {
    const sortedByPopularityDesc = titles.sort((a, b) => {
      return b.popularity - a.popularity;
    });

    const normalizedPopularity = this.normalize(
      sortedByPopularityDesc.map((title) => title.popularity),
    );

    sortedByPopularityDesc.forEach((movie, index) => {
      movie.popularity = normalizedPopularity[index];
    });

    let popularityThreshold = 0.3;
    if (titles.length > 5) {
      const meanNormalizedPopularity =
        normalizedPopularity.reduce((sum, value) => sum + value, 0) /
        normalizedPopularity.length;

      popularityThreshold = meanNormalizedPopularity;
    }

    const filteredTitles = sortedByPopularityDesc.filter(
      (title) => title.popularity > popularityThreshold,
    );

    return filteredTitles;
  }

  private normalize(array: number[]): number[] {
    const min = Math.min(...array);
    const max = Math.max(...array);

    return array.map((value) => (value - min) / (max - min));
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

  private async getMovieDetailsByIdAPI(
    movie_id: string,
  ): Promise<TitleDetailedSearchResult | null> {
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
      this.logger.error(
        `Failed to fetch movie data from TMBD API: ${response.statusText}`,
      );

      return null;
    }

    const data: TMDBMovieDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No movie results in data from TMBD API');

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

  private async getTVShowDetailsByIdAPI(
    series_id: string,
  ): Promise<TitleDetailedSearchResult | null> {
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
      this.logger.error(
        `Failed to fetch movie data from TMBD API: ${response.statusText}`,
      );

      return null;
    }

    const data: TMDBTVShowDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No movie results in data from TMBD API');

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
