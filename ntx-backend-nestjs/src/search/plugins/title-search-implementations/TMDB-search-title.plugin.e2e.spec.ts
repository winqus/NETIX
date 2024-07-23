import { ConfigModule } from '@nestjs/config/dist/config.module';
import { Test, TestingModule } from '@nestjs/testing';
import fetchMock from 'jest-fetch-mock';
import * as Joi from 'joi';
import * as path from 'path';
import { ENV_FILES, ENVIRONMENTS } from '../../../../src/constants';
import { TEST_CACHE_DIRECTORY, TEST_DIRECTORY } from '../../../../test/constants';
import { JestCacheFetch } from '../../../../test/utils/JestCacheFetch';
import stubLoggerService from '../../../../test/utils/stubLoggerService';
import { TitleSearchPluginConfig } from '../interfaces/ITitleSearchPlugin.interface';
import TMDBSearchTitlePlugin from './TMDB-search-title.plugin';

const SAVED_CACHE_FILENAME = 'titleSearchTMDB_OkResponseCache.json';

describe('TMDBSearchTitlePlugin expected titles', () => {
  let plugin: TMDBSearchTitlePlugin;
  let cacheFilePath;
  let cacheFetch: JestCacheFetch;
  const logger = stubLoggerService;

  /********************************************************************************************************************
    Test Case(s)
  /*******************************************************************************************************************/
  const TEST_TITLE_QUERIES = [
    { query: 'shrek', expected: 'Shrek', expectedPositionRange: [0, 0] },
    { query: 'shrek 2', expected: 'Shrek 2', expectedPositionRange: [0, 0] },
    { query: 'one piece', expected: 'One Piece', expectedPositionRange: [0, 0] },
    { query: 'matrix', expected: 'The Matrix', expectedPositionRange: [0, 0] },
    { query: 'star wars skywalker', expected: 'Star Wars: The Rise of Skywalker', expectedPositionRange: [0, 0] },
    { query: 'attack on titan', expected: 'Attack on Titan', expectedPositionRange: [0, 0] },
    { query: 'toy story', expected: 'Toy Story', expectedPositionRange: [0, 0] },
    { query: 'toy story 3', expected: 'Toy Story 3', expectedPositionRange: [0, 0] },
    { query: 'naruto', expected: 'Naruto', expectedPositionRange: [0, 0] },
    { query: 'naruto shippuden', expected: 'Naruto Shippūden', expectedPositionRange: [0, 0] },
    { query: 'inception', expected: 'Inception', expectedPositionRange: [0, 0] },
    { query: 'spirited away', expected: 'Spirited Away', expectedPositionRange: [0, 0] },
    { query: 'your name', expected: 'Your Name.', expectedPositionRange: [0, 0] },
    { query: 'my hero academia', expected: 'My Hero Academia', expectedPositionRange: [0, 0] },
    { query: 'frozen', expected: 'Frozen', expectedPositionRange: [0, 0] },
    { query: 'frozen 2', expected: 'Frozen II', expectedPositionRange: [0, 0] },
    { query: 'death note', expected: 'Death Note', expectedPositionRange: [0, 0] },
    { query: 'harry potter', expected: "Harry Potter and the Philosopher's Stone", expectedPositionRange: [0, 0] },
    {
      query: 'lord of the rings',
      expected: 'The Lord of the Rings: The Fellowship of the Ring',
      expectedPositionRange: [0, 3],
    },
    {
      query: 'lord of rings Fellowship',
      expected: 'The Lord of the Rings: The Fellowship of the Ring',
      expectedPositionRange: [0, 0],
    },
    { query: 'fullmetal alchemist', expected: 'Fullmetal Alchemist: Brotherhood', expectedPositionRange: [0, 0] },
    { query: 'lion king', expected: 'The Lion King', expectedPositionRange: [0, 0] },
    { query: 'finding nemo', expected: 'Finding Nemo', expectedPositionRange: [0, 0] },
    { query: 'dragon ball z', expected: 'Dragon Ball Z', expectedPositionRange: [0, 0] },
    { query: 'cowboy bebop', expected: 'Cowboy Bebop', expectedPositionRange: [0, 0] },
    { query: 'guardians of galaxy', expected: "Marvel's Guardians of the Galaxy", expectedPositionRange: [0, 0] },
    { query: 'avengers endgame', expected: 'Avengers: Endgame', expectedPositionRange: [0, 0] },
    { query: 'howl moving castle', expected: "Howl's Moving Castle", expectedPositionRange: [0, 0] },
    { query: 'spiderman homecoming', expected: 'Spider-Man: Homecoming', expectedPositionRange: [0, 0] },
    { query: 'demon slayer', expected: 'Demon Slayer: Kimetsu no Yaiba', expectedPositionRange: [0, 0] },
  ];

  TEST_TITLE_QUERIES.forEach(({ query, expected, expectedPositionRange }) => {
    it(`should return search results for "${query}" with expected title "${expected}" within range [${expectedPositionRange}]`, async () => {
      const results = await plugin.search(query);

      const titlePosition = titlePositionInResults(expected, results);

      if (isWithinRange(titlePosition, expectedPositionRange) === false) {
        consoleOutputSearchResultTable(query, results);
      }

      expect(results.length).toBeGreaterThan(0);
      expect(titlePosition).toBeGreaterThanOrEqual(expectedPositionRange[0]);
      expect(titlePosition).toBeLessThanOrEqual(expectedPositionRange[1]);
    });
  });

  /********************************************************************************************************************
    Test/service setup and teardown, helper functions
  /*******************************************************************************************************************/
  beforeAll(() => {
    fetchMock.dontMock();

    cacheFilePath = path.resolve(process.cwd(), TEST_DIRECTORY, TEST_CACHE_DIRECTORY, SAVED_CACHE_FILENAME);
    cacheFetch = new JestCacheFetch({
      cacheFilePath,
      cacheUrlOnlyMatchingRegex: /api\.themoviedb\.org/,
      forwardFetchIfNotCached: true,
      realFetchResponseDelayMs: 5,
    });

    cacheFetch.initialize(true);
  });

  afterEach(() => {
    cacheFetch.saveCache();
  });

  afterAll(() => {
    cacheFetch.finalize(true);
  });

  beforeEach(async () => {
    fetchMock.dontMock();

    const _module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ENV_FILES[ENVIRONMENTS.TEST],
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

    plugin = new TMDBSearchTitlePlugin(logger);

    const config: TitleSearchPluginConfig = {
      usePlugin: true,
      options: { apiKey: process.env.TMDB_API_KEY! },
      timeBetweenCallsMs: 5,
    };

    const result = plugin.init(config);

    if (result === false) {
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

  const isWithinRange = (position: number, expectedPositionRange: number[]): boolean => {
    return position >= expectedPositionRange[0] && position <= expectedPositionRange[1];
  };

  const consoleOutputSearchResultTable = (searchTitle: string, results: any[]) => {
    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(yellow);
    const formattedResults = results.map((r) => ({
      [`Search results for "${searchTitle}"`]: r.title,
    }));
    console.table(formattedResults);
    console.log(reset);
  };
});
