import { ConfigModule } from '@nestjs/config/dist/config.module';
import { Test } from '@nestjs/testing';
import { isWithinRange } from '@ntx/common/utils/mathUtils';
import { TitleType } from '@ntx/external-search/interfaces/TitleType.enum';
import fetchMock from 'jest-fetch-mock';
import * as Joi from 'joi';
import * as path from 'path';
import { ENV_FILES, ENVIRONMENTS } from '../../../../src/constants';
import { TEST_CACHE_DIRECTORIES, TEST_DIRECTORIES } from '../../../../test/constants';
import { JestCacheFetch } from '../../../../test/utils/JestCacheFetch';
import stubLoggerService from '../../../../test/utils/stubLoggerService';
import { TitleSearchResult } from '../../interfaces/TitleSearchResult.interface';
import { TitleSearchPluginConfig } from '../interfaces/ITitleSearchPlugin.interface';
import TMDBSearchTitlePlugin from './TMDB-search-title.plugin';

const COMPRESSED_CACHE_FILE = true;
const SAVED_CACHE_FILENAME = 'titleSearchTMDB_OkResponseCache.json';

describe('TMDBSearchTitlePlugin expected titles', () => {
  let plugin: TMDBSearchTitlePlugin;
  let cacheFilePath;
  let cacheFetch: JestCacheFetch;
  const logger = stubLoggerService;

  /********************************************************************************************************************
    Test Case(s)
  /*******************************************************************************************************************/
  const TEST_TITLE_QUERIES: [
    {
      query: string;
      expected: string;
      expectedPositionRange: [number, number];
      type?: TitleType;
    },
  ] = require('./TMDB-search-title.plugin.e2e.spec.data.json');

  TEST_TITLE_QUERIES.forEach(({ query, expected, expectedPositionRange, type }) => {
    it(`should return search results for "${query}" with expected title "${expected}" within range [${expectedPositionRange}]`, async () => {
      const results = await plugin.search(query, type);

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
    if (process.env.NODE_ENV !== ENVIRONMENTS.CI_TEST) {
      await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: [ENV_FILES[ENVIRONMENTS.TEST]],
            isGlobal: true,
            validationSchema: Joi.object({
              NODE_ENV: Joi.string().valid(ENVIRONMENTS.TEST).required(),
              TMDB_API_KEY: Joi.string().required(),
            }),
            validationOptions: {
              abortEarly: false,
            },
          }),
        ],
      }).compile();
    }

    if (process.env.NODE_ENV === ENVIRONMENTS.TEST) {
      fetchMock.dontMock();
    } else {
      fetchMock.doMock();
      fetchMock.enableMocks();
    }

    if (process.env.NODE_ENV === ENVIRONMENTS.CI_TEST) {
      cacheFilePath = path.resolve(
        process.cwd(),
        TEST_DIRECTORIES[ENVIRONMENTS.CI_TEST],
        TEST_CACHE_DIRECTORIES[ENVIRONMENTS.CI_TEST],
        SAVED_CACHE_FILENAME,
      );
    } else {
      cacheFilePath = path.resolve(
        process.cwd(),
        TEST_DIRECTORIES[ENVIRONMENTS.TEST],
        TEST_CACHE_DIRECTORIES[ENVIRONMENTS.TEST],
        SAVED_CACHE_FILENAME,
      );
    }

    cacheFetch = new JestCacheFetch({
      cacheFilePath,
      cacheUrlOnlyMatchingRegex: /api\.themoviedb\.org/,
      forwardFetchIfNotCached: true,
      realFetchResponseDelayMs: 5,
      usesFileCompression: COMPRESSED_CACHE_FILE,
    });

    cacheFetch.initialize(true);
  });

  afterAll(() => {
    if (process.env.NODE_ENV === ENVIRONMENTS.TEST) {
      cacheFetch.finalize(true);
    } else {
      cacheFetch.finalize(false);
    }
  });

  beforeEach(async () => {
    plugin = new TMDBSearchTitlePlugin(logger);

    const config: TitleSearchPluginConfig = {
      usePlugin: true,
      options: { apiKey: process.env.TMDB_API_KEY! },
      timeBetweenCallsMs: 5,
    };

    if (plugin.init(config) === false) {
      throw new Error('Failed to initialize plugin');
    }
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
