import { Logger } from '@nestjs/common';
import { loggerMock } from '@ntx-test/utils/logger.utils';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import fetchMock from 'jest-fetch-mock';
import { tmdbResponseByUrl as resp } from '../../../../test/examples/TMDB-search-title-response.examples';
import { TMDBService, TMDBSetup } from './TMDB.service';
import { TMDBWithAPIV3AndFuseJsServiceFactory } from './TMDB.service.factory';

describe('TMDBService', () => {
  let tmdb: TMDBService;
  const logger: jest.Mocked<Logger> = loggerMock;

  beforeAll(async () => {
    fetchMock.doMock();
  });

  beforeEach(async () => {
    const setup: TMDBSetup = { apiKey: 'testApiKey', rateLimitMs: 1000 };
    tmdb = TMDBWithAPIV3AndFuseJsServiceFactory(setup, logger);
  });

  it('should be defined', () => {
    expect(tmdb).toBeDefined();
  });

  describe('setup', () => {
    it('should initialize with valid setup', () => {
      expect(tmdb).toBeInstanceOf(TMDBService);
    });

    it('should throw error if API key is not provided', () => {
      const setup: TMDBSetup = { apiKey: '', rateLimitMs: 1000 };

      expect(() => TMDBWithAPIV3AndFuseJsServiceFactory(setup, logger)).toThrow();
      // expect(() => new TMDBService(setup)).toThrow();
    });
  });

  describe('search', () => {
    it('should return empty array if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await tmdb.search('test query');
      const results = await tmdb.search('test query');

      expect(logger.error).toHaveBeenCalledWith(`Rate limit exceeded`);
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

  describe('getMetadata', () => {
    it('should return null if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await tmdb.getMetadata('1', TitleType.MOVIE).catch(() => null);
      const result = await tmdb.getMetadata('1', TitleType.MOVIE);

      expect(logger.error).toHaveBeenCalledWith(`Rate limit exceeded`);
      expect(result).toBeNull();
    });

    it('should return null if ID is empty or null', async () => {
      const result = await tmdb.getMetadata(null as any, TitleType.MOVIE);

      expect(logger.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return movie details for a valid movie ID', async () => {
      fetchMock.mockResponse(JSON.stringify(resp.http_api_themoviedb_org_3_movie_809.body), {
        status: resp.http_api_themoviedb_org_3_movie_809.status,
      });

      // const result = await tmdb.searchDetailsById('1', TitleType.MOVIE);
      const result = await tmdb.getMetadata('1', TitleType.MOVIE);

      expect(result).not.toBeNull();

      expect(result).toHaveProperty('externalID');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('metadata.runtime');
    });

    it('should return TV show details for a valid TV show ID', async () => {
      fetchMock.mockResponse(JSON.stringify(resp.http_api_themoviedb_org_3_tv_111110.body), {
        status: resp.http_api_themoviedb_org_3_tv_111110.status,
      });

      const result = await tmdb.getMetadata('111110', TitleType.SERIES);

      expect(result).not.toBeNull();

      expect(result).toHaveProperty('externalID');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('metadata.numberOfSeasons');
    });

    it('should return null for an unknown title type', async () => {
      const result = await tmdb.getMetadata('1', 'UNKNOWN' as any);

      expect(logger.error).toHaveBeenCalledWith('Unknown title type: UNKNOWN');
      expect(result).toBeNull();
    });
  });

  it('should not call API if rate limit exceeded using several different methods', async () => {
    fetchMock.mockResponse(JSON.stringify([]), { status: 200 });
    fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

    await tmdb.search('test query');
    await tmdb.getMetadata('123', TitleType.MOVIE);

    expect(logger.error).toHaveBeenCalledWith(`Rate limit exceeded`);
  });
});
