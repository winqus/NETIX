import { Logger } from '@nestjs/common';
import { loggerMock } from '@ntx-test/utils/logger.utils';
import { TMDBMovieGatewayAPIv3 } from './TMDB-movie-gateway-api-v3.class';
import { TMDBConfig } from './TMDB.service';
import { TMDBMovieSearchOptions } from './interfaces/TMDB-movie-gateway.interface';

jest.mock('@ntx/common/utils/delay.utils', () => ({
  delayByMs: jest.fn().mockResolvedValue(undefined),
}));

describe('TMDBMovieGatewayAPIv3', () => {
  const logger: Logger = loggerMock;
  const config: TMDBConfig = { apiKey: 'testApiKey', rateLimitMs: 10 };

  let gateway: TMDBMovieGatewayAPIv3;

  beforeAll(() => {
    fetchMock.doMock();
  });

  beforeEach(() => {
    gateway = new TMDBMovieGatewayAPIv3(config, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchMock.mockClear();
  });

  describe('constructor', () => {
    it('throws an error if no apiKey is provided', () => {
      expect(() => new TMDBMovieGatewayAPIv3({ apiKey: '', rateLimitMs: 100 }, logger)).toThrow(/API key is required/);
    });

    it('initializes successfully with a valid apiKey and rateLimitMs', () => {
      const config: TMDBConfig = { apiKey: 'testApiKey', rateLimitMs: 100 };
      expect(() => new TMDBMovieGatewayAPIv3(config, logger)).not.toThrow();
    });
  });

  describe('search', () => {
    it('returns null and logs error for empty query', async () => {
      const result = await gateway.search({ query: '' });
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Movie query is empty or null');
    });

    it('sends correct API request and handles successful response', async () => {
      fetchMock.mockResponse(
        JSON.stringify({
          page: 1,
          results: [{ id: 1, original_title: 'Test Movie', popularity: 10, release_date: '2022-01-01' }],
          total_pages: 1,
          total_results: 1,
        }),
      );

      const options: TMDBMovieSearchOptions = { query: 'Test', language: 'en-US', include_adult: 'false' };
      const result = await gateway.search(options);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=Test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${config.apiKey}`,
          }),
        }),
      );

      expect(result).toEqual([
        {
          page: 1,
          results: [{ id: 1, original_title: 'Test Movie', popularity: 10, release_date: '2022-01-01' }],
          total_pages: 1,
          total_results: 1,
        },
      ]);
    });

    it('logs error and returns null for failed fetch response', async () => {
      fetchMock.mockResponse('', { status: 404, statusText: 'Not Found' });
      const options: TMDBMovieSearchOptions = { query: 'Test' };
      const result = await gateway.search(options);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch movie data from TMDB API v3: Not Found');
    });
  });

  describe('getDetailsByID', () => {
    it('returns null and logs error for empty movieID', async () => {
      const result = await gateway.getDetailsByID('');
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('movieID is empty or null');
    });

    it('fetches details successfully for a valid movieID', async () => {
      fetchMock.mockResponse(
        JSON.stringify({
          id: 1,
          original_title: 'Test Movie',
          popularity: 10,
          release_date: '2022-01-01',
          overview: 'Overview',
          genres: [{ id: 1, name: 'Drama' }],
        }),
      );

      const result = await gateway.getDetailsByID('1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${config.apiKey}`,
          }),
        }),
      );

      expect(result).toEqual({
        id: 1,
        original_title: 'Test Movie',
        popularity: 10,
        release_date: '2022-01-01',
        overview: 'Overview',
        genres: [{ id: 1, name: 'Drama' }],
      });
    });

    it('logs error and returns null for failed fetch in getDetailsByID', async () => {
      fetchMock.mockResponse('', { status: 404, statusText: 'Not Found' });
      const result = await gateway.getDetailsByID('1');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch movie details from TMDB API v3: Not Found');
    });
  });
});
