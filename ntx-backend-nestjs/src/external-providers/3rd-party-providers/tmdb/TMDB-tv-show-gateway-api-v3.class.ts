import { Logger } from '@nestjs/common';
import { delayByMs } from '@ntx/common/utils/delay.utils';
import { TMDBTVShowGateway, TMDBTVShowSearchOptions } from './interfaces/TMDB-tv-show-gateway.interface';
import { TMDBSearchResult } from './interfaces/TMDBSearchResult';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBTVShowDetails } from './interfaces/TMDBTVShowDetails';
import { TMDBConfig } from './TMDB.service';

const maxResultPagesToSearchThrough = 5;
const TMDB_API_V3_BASE_URL = 'https://api.themoviedb.org/3';
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

  public async search(options: TMDBTVShowSearchOptions): Promise<TMDBSearchResult<TMDBTVShow>[] | null> {
    if (options.language == null || options.language == '') {
      options.language = 'en-US';
    }

    if (options.include_adult == null) {
      options.include_adult = 'false';
    }

    const { title, year, language, include_adult } = options;

    if (title == '' || title == null) {
      this.logger.error('TV Show title is empty or null');

      return null;
    }

    const allResults: TMDBSearchResult<TMDBTVShow>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages && currentPage <= maxResultPagesToSearchThrough) {
      const params = new URLSearchParams();
      params.append('query', encodeURIComponent(title));
      params.append('include_adult', include_adult);
      params.append('language', language);
      params.append('page', currentPage.toString());
      if (year != null) {
        params.append('first_air_date_year', year || '');
      }

      const url = `${TMDB_API_SEARCH_TV_SHOW_ROUTE}?${params.toString()}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
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
      await delayByMs(10);
    }

    return allResults.length > 0 ? allResults : null;
  }

  public async getDetailsByID(tvShowID: string): Promise<TMDBTVShowDetails | null> {
    if (tvShowID == null || tvShowID == '') {
      this.logger.error('tvShowID is empty or null');

      return null;
    }

    const params = new URLSearchParams();
    params.append('language', 'en-US');

    const url = `${TMDB_API_TV_SHOW_DETAILS_ROUTE}/${tvShowID}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    };

    const response = await fetch(url, options);
    if (response.ok === false) {
      this.logger.error(`Failed to fetch TV Show data from TMDB API: ${response.statusText}`);

      return null;
    }

    const data: TMDBTVShowDetails = await response.json();
    if (data == null || 'id' in data === false) {
      this.logger.error('No TV Show results in data from TMDB API');

      return null;
    }

    return {
      adult: data.adult,
      backdrop_path: data.backdrop_path,
      created_by: data.created_by,
      episode_run_time: data.episode_run_time,
      first_air_date: data.first_air_date,
      genres: data.genres,
      homepage: data.homepage,
      id: data.id,
      in_production: data.in_production,
      languages: data.languages,
      last_air_date: data.last_air_date,
      last_episode_to_air: data.last_episode_to_air,
      name: data.name,
      next_episode_to_air: data.next_episode_to_air,
      networks: data.networks,
      number_of_episodes: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
      origin_country: data.origin_country,
      original_language: data.original_language,
      original_name: data.original_name,
      overview: data.overview,
      popularity: data.popularity,
      poster_path: data.poster_path,
      production_companies: data.production_companies,
      production_countries: data.production_countries,
      seasons: data.seasons,
      spoken_languages: data.spoken_languages,
      status: data.status,
      tagline: data.tagline,
      type: data.type,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
    };
  }
}
