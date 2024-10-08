import { Logger } from '@nestjs/common';
import { delayByMs } from '@ntx/common/utils/delay.utils';
import { TMDBMovieGateway, TMDBMovieSearchOptions } from './interfaces/TMDB-movie-gateway.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBMovieDetails } from './interfaces/TMDBMovieDetails';
import { TMDBSearchResult } from './interfaces/TMDBSearchResult';
import { TMDB_API_V3_BASE_URL } from './TMDB.constants';
import { TMDBConfig } from './TMDB.service';

const MAX_RESULT_PAGES_TO_SEARCH_THROUGH = 5;
const TMDB_API_SEARCH_MOVIE_ROUTE = `${TMDB_API_V3_BASE_URL}/search/movie`;
const TMDB_API_MOVIE_DETAILS_ROUTE = `${TMDB_API_V3_BASE_URL}/movie`;

export class TMDBMovieGatewayAPIv3 implements TMDBMovieGateway {
  constructor(
    private readonly config: TMDBConfig,
    private readonly logger: Logger,
  ) {
    if (!config?.apiKey || config.apiKey === '') {
      throw new Error('API key is required to use TMDB API Movie Gateway');
    }
  }

  public async search(options: TMDBMovieSearchOptions): Promise<TMDBSearchResult<TMDBMovie>[] | null> {
    if (options.language == null || options.language == '') {
      options.language = 'en-US';
    }

    if (options.include_adult == null) {
      options.include_adult = 'false';
    }

    const { query, year, language, include_adult } = options;

    if (query == '' || query == null) {
      this.logger.error('Movie query is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBMovie>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages && currentPage <= MAX_RESULT_PAGES_TO_SEARCH_THROUGH) {
      const params = new URLSearchParams();
      params.append('query', encodeURIComponent(query));
      params.append('include_adult', include_adult);
      params.append('language', language);
      params.append('page', currentPage.toString());
      if (year != null) {
        params.append('year', year || '');
      }

      const url = `${TMDB_API_SEARCH_MOVIE_ROUTE}?${params.toString()}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      };

      const response = await fetch(url, options);
      if (response.ok === false) {
        this.logger.error(`Failed to fetch movie data from TMDB API: ${response.statusText}`);

        return null;
      }

      const data: TMDBSearchResult<TMDBMovie> = await response.json();
      if (data == null || 'results' in data === false) {
        this.logger.error('No movie results property in response from TMDB API');

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
      await delayByMs(10);
    }

    return allResults.length > 0 ? allResults : null;
  }

  public async getDetailsByID(movieID: string): Promise<TMDBMovieDetails | null> {
    if (movieID == null || movieID == '') {
      this.logger.error('movieID is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('language', 'en-US');

    const url = `${TMDB_API_MOVIE_DETAILS_ROUTE}/${movieID}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    };

    const response = await fetch(url, options);
    if (response.ok === false) {
      this.logger.error(`Failed to fetch movie details from TMDB API v3: ${response.statusText}`);

      return null;
    }

    const data: TMDBMovieDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No movie details in response from TMDB API v3');

      return null;
    }

    return {
      adult: data.adult,
      backdrop_path: data.backdrop_path,
      belongs_to_collection: data.belongs_to_collection,
      budget: data.budget,
      genres: data.genres,
      homepage: data.homepage,
      id: data.id,
      imdb_id: data.imdb_id,
      origin_country: data.origin_country,
      original_language: data.original_language,
      original_title: data.original_title,
      overview: data.overview,
      popularity: data.popularity,
      poster_path: data.poster_path,
      production_companies: data.production_companies,
      production_countries: data.production_countries,
      release_date: data.release_date,
      revenue: data.revenue,
      runtime: data.runtime,
      spoken_languages: data.spoken_languages,
      status: data.status,
      tagline: data.tagline,
      title: data.title,
      video: data.video,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
    };
  }
}
