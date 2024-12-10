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

    return response.json();
  }

  private buildSearchParams(options: TMDBTVShowSearchOptions, currentPage: number): URLSearchParams {
    const params = new URLSearchParams();
    params.append('query', encodeURIComponent(options.query));
    params.append('include_adult', options.include_adult || 'false');
    params.append('language', options.language || 'en-US');
    params.append('page', currentPage.toString());

    if (options.year) {
      params.append('first_air_date_year', options.year);
    }

    return params;
  }

  private async fetchSearchPage(params: URLSearchParams): Promise<TMDBSearchResult<TMDBTVShow> | null> {
    const url = `${TMDB_API_SEARCH_TV_SHOW_ROUTE}?${params.toString()}`;

    return await this._makeApiRequest<TMDBSearchResult<TMDBTVShow>>(url, 'TV show');
  }

  private filterValidResults(data: TMDBSearchResult<TMDBTVShow>): TMDBTVShow[] {
    return data.results.filter(
      (tv_show) => 'popularity' in tv_show && 'first_air_date' in tv_show && tv_show.first_air_date.length > 0,
    );
  }

  public async search(options: TMDBTVShowSearchOptions): Promise<TMDBSearchResult<TMDBTVShow>[] | null> {
    if (!options.query) {
      this.logger.error('TV Show query is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBTVShow>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages && currentPage <= MAX_RESULT_PAGES_TO_SEARCH_THROUGH) {
      const params = this.buildSearchParams(options, currentPage);
      const data = await this.fetchSearchPage(params);

      if (!data || !data.results) {
        this.logger.error('No TV show results in data from TMDB API');

        return null;
      }

      const filteredResults = this.filterValidResults(data);
      if (filteredResults.length === 0) {
        break;
      }

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
    if (!data || !('id' in data)) {
      this.logger.error('No TV Show results in data from TMDB API');

      return null;
    }

    return data;
  }
}
