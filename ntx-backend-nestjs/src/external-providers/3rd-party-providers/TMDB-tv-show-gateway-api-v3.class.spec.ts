import { Logger } from '@nestjs/common';
import { TMDBTVShowSearchOptions } from './tmdb/interfaces/TMDB-tv-show-gateway.interface';
import { TMDBTVShowGatewayAPIv3 } from './tmdb/TMDB-tv-show-gateway-api-v3.class';
import { TMDBConfig } from './tmdb/TMDB.service';

jest.mock('@ntx/common/utils/delay.utils', () => ({
  delayByMs: jest.fn().mockResolvedValue(undefined),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TMDBTVShowGatewayAPIv3', () => {
  let gateway: TMDBTVShowGatewayAPIv3;
  let logger: Logger;
  let config: TMDBConfig;

  beforeEach(() => {
    logger = new Logger();
    jest.spyOn(logger, 'error').mockImplementation(jest.fn());
    config = { apiKey: 'testApiKey', rateLimitMs: 10 };
    gateway = new TMDBTVShowGatewayAPIv3(config, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('throws an error if no apiKey is provided', () => {
      expect(() => new TMDBTVShowGatewayAPIv3({ apiKey: '', rateLimitMs: 100 }, logger)).toThrow(
        'API key is required to use TMDB API Movie Gateway',
      );
    });

    it('initializes successfully with a valid apiKey and rateLimitMs', () => {
      const config: TMDBConfig = { apiKey: 'testApiKey', rateLimitMs: 100 };
      expect(() => new TMDBTVShowGatewayAPIv3(config, logger)).not.toThrow();
    });
  });

  describe('search', () => {
    it('returns null and logs error for empty query', async () => {
      const result = await gateway.search({ query: '' });
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('TV Show query is empty or null');
    });

    it('sends correct API request and handles successful response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          page: 1,
          results: [{ id: 1, name: 'Test Show', popularity: 10, first_air_date: '2022-01-01' }],
          total_pages: 1,
          total_results: 1,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const options: TMDBTVShowSearchOptions = { query: 'Test', language: 'en-US', include_adult: 'false' };
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
          results: [{ id: 1, name: 'Test Show', popularity: 10, first_air_date: '2022-01-01' }],
          total_pages: 1,
          total_results: 1,
        },
      ]);
    });

    it('logs error and returns null for failed fetch response', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });
      const options: TMDBTVShowSearchOptions = { query: 'Test' };
      const result = await gateway.search(options);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch TV show data from TMDB API: Not Found');
    });
  });

  describe('getDetailsByID', () => {
    it('returns null and logs error for empty tvShowID', async () => {
      const result = await gateway.getDetailsByID('');
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('tvShowID is empty or null');
    });

    it('fetches details successfully for a valid tvShowID', async () => {
      const mockDetailsResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Test Show',
          popularity: 10,
          first_air_date: '2022-01-01',
          overview: 'Overview',
          genres: [{ id: 1, name: 'Drama' }],
        }),
      };
      mockFetch.mockResolvedValue(mockDetailsResponse as any);

      const result = await gateway.getDetailsByID('1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${config.apiKey}`,
          }),
        }),
      );

      expect(result).toEqual({
        id: 1,
        name: 'Test Show',
        popularity: 10,
        first_air_date: '2022-01-01',
        overview: 'Overview',
        genres: [{ id: 1, name: 'Drama' }],
      });
    });

    it('logs error and returns null for failed fetch in getDetailsByID', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });
      const result = await gateway.getDetailsByID('1');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch TV Show data from TMDB API: Not Found');
    });
  });
});
