import { ConsoleLogger, Logger } from '@nestjs/common';
import { ConfigFactory } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { Test } from '@nestjs/testing';
import { TEST_DATA_DIRECTORY, TEST_DIRECTORY } from '@ntx-test/constants';
import { JestCacheFetch } from '@ntx-test/utils/JestCacheFetch';
import { loggerMock } from '@ntx-test/utils/logger.utils';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { isWithinRange } from '@ntx/common/utils/mathUtils';
import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';
import fetchMock from 'jest-fetch-mock';
import * as path from 'path';
import { TMDBService, TMDBSetup } from './TMDB.service';

describe('TMDBService with TMDB API calls for titles', () => {
  const FORWARD_FETCH_IF_NOT_CACHED = false;
  const COMPRESSED_CACHE_FILE = true;
  const SAVED_CACHE_FILENAME = 'titleSearchTMDB_OkResponseCache.json';
  const ENABLE_LOGGER = false;

  let tmdb: TMDBService;
  let cacheFilePath;
  let cacheFetch: JestCacheFetch;
  const logger: Logger = ENABLE_LOGGER ? (new ConsoleLogger('TMDBService') as any) : loggerMock;

  const testConfigurationFactory: ConfigFactory = () => ({
    // Nothing for now
  });

  /********************************************************************************************************************
    Test Case(s)
  /*******************************************************************************************************************/
  it('should be defined', () => {
    expect(tmdb).toBeDefined();
  });

  const TEST_TITLE_QUERIES: [
    {
      query: string;
      expected: string;
      expectedPositionRange: [number, number];
      type?: TitleType;
    },
  ] = require('./TMDB-search-title.service.e2e.spec.data.json');

  TEST_TITLE_QUERIES.forEach(({ query, expected, expectedPositionRange, type }) => {
    it(`should return search results for "${query}" with expected title "${expected}" within range [${expectedPositionRange}]`, async () => {
      const results = await tmdb.search(query, type);

      const titlePosition = titlePositionInResults(expected, results);

      if (isWithinRange(titlePosition, expectedPositionRange) === false) {
        consoleOutputTitleSearchResultTable(
          query,
          results,
          ['title', 'weight', 'type', 'releaseDate'],
          // ['title', 'weight', 'type', 'releaseDate', 'originalWeight'], // For debugging
          expected,
        );
      }

      expect(results.length).toBeGreaterThan(0);
      expect(titlePosition).toBeGreaterThanOrEqual(expectedPositionRange[0]);
      expect(titlePosition).toBeLessThanOrEqual(expectedPositionRange[1]);
    });
  });

  /********************************************************************************************************************
    Test/service setup and teardown, helper functions
  /*******************************************************************************************************************/
  beforeAll(async () => {
    /* If using fetch cached data  ************************************************************* */
    // fetchMock.doMock();
    // fetchMock.enableMocks();
    /* Else - using real fetch call to api (not using cached data, or refreshing the cache file) */
    fetchMock.dontMock();
    /* ***************************************************************************************** */

    await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [testConfigurationFactory],
        }),
      ],
    }).compile();

    cacheFilePath = path.resolve(process.cwd(), TEST_DIRECTORY, TEST_DATA_DIRECTORY, SAVED_CACHE_FILENAME);

    cacheFetch = new JestCacheFetch({
      cacheFilePath,
      cacheUrlOnlyMatchingRegex: /api\.themoviedb\.org/,
      forwardFetchIfNotCached: FORWARD_FETCH_IF_NOT_CACHED,
      realFetchResponseDelayMs: 5,
      usesFileCompression: COMPRESSED_CACHE_FILE,
    });

    cacheFetch.initialize(true);
  });

  afterAll(() => {
    if ((FORWARD_FETCH_IF_NOT_CACHED as boolean) === true) {
      cacheFetch.finalize(true);
    } else {
      cacheFetch.finalize(false);
    }
  });

  beforeEach(() => {
    const tmdb_api_key = process.env.TMDB_API_KEY || 'stub-tmdb-api-key';

    const setup: TMDBSetup = { apiKey: tmdb_api_key, rateLimitMs: 5 };

    tmdb = new TMDBService(setup, logger);
  });

  const titlePositionInResults = (title: string, results: any[]): number => {
    let position = -1;
    for (let i = 0; i < results.length; i++) {
      if (results[i].title.toLowerCase() === title.toLowerCase()) {
        position = i;
        break;
      }
    }

    return position;
  };

  const consoleOutputTitleSearchResultTable = (
    searchTitle: string,
    results: TitleSearchResult[],
    tableProperties = ['title', 'weight', 'type'],
    expectedTitle?: string,
  ) => {
    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(yellow);
    const expectedTitleString = expectedTitle ? ` (expected: "${expectedTitle}")` : '';

    const formattedResults = results.map((r) => {
      const result: { [key: string]: any } = {
        [`title (search results for "${searchTitle}")${expectedTitleString}`]: r.title,
      };

      tableProperties.forEach((prop) => {
        if (prop !== 'title') {
          result[prop] = r[prop as keyof TitleSearchResult];
        }
      });

      return result;
    });

    console.table(formattedResults);
    console.log(reset);
  };
});
