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
    if (!config?.apiKey?.trim()) {
      throw new Error('API key is required to use TMDB API Movie Gateway');
    }
  }

  public async search(options: TMDBMovieSearchOptions): Promise<TMDBSearchResult<TMDBMovie>[] | null> {
    const { query, year, language = 'en-US', include_adult = 'false' } = options;

    if (!query?.trim()) {
      this.logger.error('Movie query is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBMovie>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages && currentPage <= MAX_RESULT_PAGES_TO_SEARCH_THROUGH) {
      const params = new URLSearchParams({
        query: encodeURIComponent(query),
        include_adult,
        language,
        page: currentPage.toString(),
      });

      if (year) {
        params.append('year', year);
      }

      const url = `${TMDB_API_SEARCH_MOVIE_ROUTE}?${params.toString()}`;
      const data = await this.makeApiRequest<TMDBSearchResult<TMDBMovie>>(url, 'movie data');

      if (data == null) {
        return null;
      }

      if (!('results' in data)) {
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
    if (!movieID || movieID.trim() === '') {
      this.logger.error('movieID is empty or null');

      return null;
    }

    const params = new URLSearchParams({
      language: 'en-US',
    });

    const url = `${TMDB_API_MOVIE_DETAILS_ROUTE}/${movieID}?${params.toString()}`;
    const data = await this.makeApiRequest<TMDBMovieDetails>(url, 'movie details');

    if (data == null) {
      return null;
    }

    if (!('id' in data)) {
      this.logger.error('Failed to fetch movie details from TMDB API v3: Not Found');

      return null;
    }

    return data;
  }

  private async makeApiRequest<T>(url: string, errorContext: string): Promise<T | null> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        this.logger.error(`Failed to fetch ${errorContext} from TMDB API v3: ${response.statusText}`);

        return null;
      }

      const data: T = await response.json();

      return data;
    } catch (error) {
      this.logger.error(`Error while fetching ${errorContext} data from TMDB API v3: ${error}`);

      return null;
    }
  }
}
