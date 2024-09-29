import { Logger } from '@nestjs/common';
import { replaceLoggerPropertyWithMock } from '@ntx-test/utils/logger.utils';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import fetchMock from 'jest-fetch-mock';
import { tmdbResponseByUrl as resp } from '../../../../test/examples/TMDB-search-title-response.examples';
import { TMDBService, TMDBSetup } from './TMDB.service';

describe('TMDBService', () => {
  let tmdb: TMDBService;
  let logger: jest.Mocked<Logger>;

  beforeAll(async () => {
    fetchMock.doMock();
  });

  beforeEach(async () => {
    tmdb = new TMDBService({ apiKey: 'testApiKey', rateLimitMs: 1000 });
    logger = replaceLoggerPropertyWithMock(tmdb);
  });

  it('should be defined', () => {
    expect(tmdb).toBeDefined();
  });

  describe('setup', () => {
    it('should initialize with valid setup', () => {
      const setup: TMDBSetup = { apiKey: 'testApiKey', rateLimitMs: 1000 };

      const tmdb = new TMDBService(setup);
      replaceLoggerPropertyWithMock(tmdb);

      expect(tmdb).toBeInstanceOf(TMDBService);
    });

    it('should throw error if API key is not provided', () => {
      const setup: TMDBSetup = { apiKey: '', rateLimitMs: 1000 };

      expect(() => new TMDBService(setup)).toThrow();
    });
  });

  describe('search', () => {
    it('should return empty array if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await tmdb.search('test query');
      const results = await tmdb.search('test query');

      expect(logger.warn).toHaveBeenCalledWith(`Rate limit exceeded`);
      expect(results).toEqual([]);
    });

    it('should return empty array if query is empty or null', async () => {
      const results = await tmdb.search('');

      expect(logger.error).toHaveBeenCalled();
      expect(results).toEqual([]);
    });

    it('should return search results for a valid query', async () => {
      fetchMock.mockResponses(
        [
          JSON.stringify(resp.http_api_themoviedb_org_3_search_movie_query_shrek_2.body),
          {
            status: resp.http_api_themoviedb_org_3_search_movie_query_shrek_2.status,
          },
        ],
        [
          JSON.stringify(resp.http_api_themoviedb_org_3_search_tv_query_hell_divers.body),
          {
            status: resp.http_api_themoviedb_org_3_search_tv_query_hell_divers.status,
          },
        ],
      );

      const results = await tmdb.search('shrek 2');

      expect(results[0].metadata.originalName).toEqual('Shrek 2');
    });
  });

  describe('searchById', () => {
    it('should return null if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await tmdb.searchDetailsById('1', TitleType.MOVIE);
      const result = await tmdb.searchDetailsById('1', TitleType.MOVIE);

      expect(logger.warn).toHaveBeenCalledWith(`Rate limit exceeded (${tmdb.pluginUUID})`);
      expect(result).toBeNull();
    });

    it('should return null if ID is empty or null', async () => {
      const result = await tmdb.searchDetailsById('', TitleType.MOVIE);

      expect(logger.error).toHaveBeenCalledWith('ID is empty or null');
      expect(result).toBeNull();
    });

    it('should return movie details for a valid movie ID', async () => {
      fetchMock.mockResponse(JSON.stringify(resp.http_api_themoviedb_org_3_movie_809.body), {
        status: resp.http_api_themoviedb_org_3_movie_809.status,
      });

      const result = await tmdb.searchDetailsById('1', TitleType.MOVIE);

      expect(result).not.toBeNull();

      expect(result).toMatchObject({
        id: expect.stringMatching(/^\d+$/),
        title: expect.any(String),
        originalTitle: expect.any(String),
        releaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        sourceUUID: tmdb.pluginUUID,
        type: TitleType.MOVIE,
        details: {
          runtime: expect.any(Number),
        },
      });
    });

    it('should return TV show details for a valid TV show ID', async () => {
      fetchMock.mockResponse(JSON.stringify(resp.http_api_themoviedb_org_3_tv_111110.body), {
        status: resp.http_api_themoviedb_org_3_tv_111110.status,
      });

      const result = await tmdb.searchDetailsById('111110', TitleType.SERIES);

      expect(result).not.toBeNull();

      expect(result).toMatchObject({
        id: expect.stringMatching(/^\d+$/),
        title: expect.any(String),
        originalTitle: expect.any(String),
        type: TitleType.SERIES,
        releaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        sourceUUID: tmdb.pluginUUID,
        details: {
          numberOfSeasons: expect.any(Number),
          numberOfEpisodes: expect.any(Number),
          seasons: expect.arrayContaining([
            {
              id: expect.stringMatching(/^\d+$/),
              name: expect.any(String),
              seasonNumber: expect.any(Number),
              episodeCount: expect.any(Number),
              releaseDate: expect.anything(),
            },
          ]),
        },
      });

      expect(result!.releaseDate).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) || null);
    });

    it('should return null for an unknown title type', async () => {
      const result = await tmdb.searchDetailsById('1', 'UNKNOWN' as any);

      expect(logger.error).toHaveBeenCalledWith('Unknown title type');
      expect(result).toBeNull();
    });
  });
});
