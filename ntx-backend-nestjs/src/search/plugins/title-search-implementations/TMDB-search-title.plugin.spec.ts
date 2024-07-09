import { LoggerService } from '@nestjs/common';
import fetchMock from 'jest-fetch-mock';
import { tmdbResponseByUrl as resp } from '../../../../test/examples/TMDB-search-title-response.examples';
import { TitleType } from '../../interfaces/TitleType.enum';
import { TitleSearchPluginConfig } from '../interfaces/ITitleSearchPlugin.interface';
import TMBDSearchTitlePlugin from './TMDB-search-title.plugin';

const mockLogger: LoggerService = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as LoggerService;

jest.mock('@nestjs/common/services/logger.service', () => ({
  Logger: jest.fn(() => mockLogger),
}));

(global as any).mockLogger = mockLogger;

describe('TMBDSearchTitlePlugin', () => {
  let plugin: TMBDSearchTitlePlugin;

  beforeEach(() => {
    fetchMock.doMock();
    plugin = new TMBDSearchTitlePlugin(mockLogger);
    plugin.init({
      usePlugin: true,
      options: { apiKey: 'testApiKey' },
      timeBetweenCallsMs: 1000,
    });
  });

  describe('init', () => {
    it('should initialize with valid config', () => {
      const config: TitleSearchPluginConfig = {
        usePlugin: true,
        options: { apiKey: 'testApiKey' },
        timeBetweenCallsMs: 1000,
      };

      const result = plugin.init(config);

      expect(result).toBe(true);
    });

    it('should throw error if API key is not provided', () => {
      const config: TitleSearchPluginConfig = {
        usePlugin: true,
        options: {},
        timeBetweenCallsMs: 1000,
      };

      expect(() => plugin.init(config)).toThrow();
    });

    it('should throw error if timeBetweenCallsMs is not provided', () => {
      const config: TitleSearchPluginConfig = {
        usePlugin: true,
        options: { apiKey: 'testApiKey' },
      } as any;

      expect(() => plugin.init(config)).toThrow();
    });
  });

  describe('search', () => {
    it('should return empty array if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await plugin.search('test query');
      const results = await plugin.search('test query');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Rate limit exceeded (${plugin.pluginUUID})`,
      );
      expect(results).toEqual([]);
    });

    it('should return empty array if query is empty or null', async () => {
      const results = await plugin.search('');

      expect(mockLogger.error).toHaveBeenCalled();
      expect(results).toEqual([]);
    });

    it('should return search results for a valid query', async () => {
      fetchMock.mockResponses(
        [
          JSON.stringify(
            resp.http_api_themoviedb_org_3_search_movie_query_shrek_2.body,
          ),
          {
            status:
              resp.http_api_themoviedb_org_3_search_movie_query_shrek_2.status,
          },
        ],
        [
          JSON.stringify(
            resp.http_api_themoviedb_org_3_search_tv_query_hell_divers.body,
          ),
          {
            status:
              resp.http_api_themoviedb_org_3_search_tv_query_hell_divers.status,
          },
        ],
      );

      const results = await plugin.search('shrek 2');

      expect(results).toHaveLength(1);
    });
  });

  describe('searchById', () => {
    it('should return null if rate limit exceeded', async () => {
      fetchMock.mockResponse(JSON.stringify([]), { status: 200 });

      await plugin.searchById('1', TitleType.MOVIE);
      const result = await plugin.searchById('1', TitleType.MOVIE);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Rate limit exceeded (${plugin.pluginUUID})`,
      );
      expect(result).toBeNull();
    });

    it('should return null if ID is empty or null', async () => {
      const result = await plugin.searchById('', TitleType.MOVIE);

      expect(mockLogger.error).toHaveBeenCalledWith('ID is empty or null');
      expect(result).toBeNull();
    });

    it('should return movie details for a valid movie ID', async () => {
      fetchMock.mockResponse(
        JSON.stringify(resp.http_api_themoviedb_org_3_movie_809.body),
        {
          status: resp.http_api_themoviedb_org_3_movie_809.status,
        },
      );

      const result = await plugin.searchById('1', TitleType.MOVIE);

      expect(result).not.toBeNull();

      expect(result).toMatchObject({
        id: expect.stringMatching(/^\d+$/),
        title: expect.any(String),
        originalTitle: expect.any(String),
        releaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        sourceUUID: plugin.pluginUUID,
        type: TitleType.MOVIE,
        details: {
          runtime: expect.any(Number),
        },
      });
    });

    it('should return TV show details for a valid TV show ID', async () => {
      fetchMock.mockResponse(
        JSON.stringify(resp.http_api_themoviedb_org_3_tv_111110.body),
        {
          status: resp.http_api_themoviedb_org_3_tv_111110.status,
        },
      );

      const result = await plugin.searchById('111110', TitleType.SERIES);

      expect(result).not.toBeNull();

      expect(result).toMatchObject({
        id: expect.stringMatching(/^\d+$/),
        title: expect.any(String),
        originalTitle: expect.any(String),
        type: TitleType.SERIES,
        releaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        sourceUUID: plugin.pluginUUID,
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

      expect(result!.releaseDate).toEqual(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) || null,
      );
    });

    it('should return null for an unknown title type', async () => {
      const result = await plugin.searchById('1', 'UNKNOWN' as any);

      expect(mockLogger.error).toHaveBeenCalledWith('Unknown title type');
      expect(result).toBeNull();
    });
  });
});
