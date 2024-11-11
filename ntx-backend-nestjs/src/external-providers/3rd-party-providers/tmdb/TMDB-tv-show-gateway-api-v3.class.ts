import { Logger } from '@nestjs/common';
import { delayByMs } from '@ntx/common/utils/delay.utils';
import { TMDBTVShowGateway, TMDBTVShowSearchOptions } from './interfaces/TMDB-tv-show-gateway.interface';
import { TMDBSearchResult } from './interfaces/TMDBSearchResult';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBTVShowDetails } from './interfaces/TMDBTVShowDetails';
import { TMDB_API_V3_BASE_URL } from './TMDB.constants';
import { TMDBConfig } from './TMDB.service';

const MAX_RESULT_PAGES_TO_SEARCH_THROUGH = 5;
const TMDB_API_SEARCH_TV_SHOW_ROUTE = `${TMDB_API_V3_BASE_URL}/search/tv`;
const TMDB_API_TV_SHOW_DETAILS_ROUTE = `${TMDB_API_V3_BASE_URL}/tv`;

export class TMDBTVShowGatewayAPIv3 implements TMDBTVShowGateway {
  constructor(
    private readonly config: TMDBConfig,
    private readonly logger: Logger,
  ) {
    if (!config?.apiKey || config.apiKey === '') {
      throw new Error('API key is required to use TMDB API Movie Gateway');
    }
  }

  private async _makeApiRequest<T>(url: string, errorContext: string): Promise<T | null> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      this.logger.error(`Failed to fetch ${errorContext} data from TMDB API: ${response.statusText}`);

      return null;
    }

    const data = await response.json();

    return data;
  }

  public async search(options: TMDBTVShowSearchOptions): Promise<TMDBSearchResult<TMDBTVShow>[] | null> {
    const query = options.query;
    if (!query) {
      this.logger.error('TV Show query is empty or null');

      return null;
    }

    const language = options.language || 'en-US';
    const include_adult = options.include_adult || 'false';
    const year = options.year;

    const allResults: TMDBSearchResult<TMDBTVShow>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages && currentPage <= MAX_RESULT_PAGES_TO_SEARCH_THROUGH) {
      const params = new URLSearchParams();
      params.append('query', encodeURIComponent(query));
      params.append('include_adult', include_adult);
      params.append('language', language);
      params.append('page', currentPage.toString());
      if (year != null && year !== '') {
        params.append('first_air_date_year', year);
      }

      const url = `${TMDB_API_SEARCH_TV_SHOW_ROUTE}?${params.toString()}`;

      const data = await this._makeApiRequest<TMDBSearchResult<TMDBTVShow>>(url, 'TV show');
      if (data == null) {
        return null;
      }
      if (!('results' in data)) {
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
      await delayByMs(10);
    }

    return allResults.length > 0 ? allResults : null;
  }

  public async getDetailsByID(tvShowID: string): Promise<TMDBTVShowDetails | null> {
    if (!tvShowID) {
      this.logger.error('tvShowID is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('language', 'en-US');

    const url = `${TMDB_API_TV_SHOW_DETAILS_ROUTE}/${tvShowID}?${params.toString()}`;

    const data = await this._makeApiRequest<TMDBTVShowDetails>(url, 'TV Show');
    if (data == null) {
      return null;
    }
    if (!('id' in data)) {
      this.logger.error('No TV Show results in data from TMDB API');

      return null;
    }

    return data;
  }
}
