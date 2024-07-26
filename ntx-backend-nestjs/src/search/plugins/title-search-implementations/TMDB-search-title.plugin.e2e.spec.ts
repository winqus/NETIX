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
    //{ query: 'naruto shippuden', expected: 'Naruto Shippūden', expectedPositionRange: [0, 0] },
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
    { query: 'fullmetal alchemist', expected: 'Fullmetal Alchemist', expectedPositionRange: [0, 0] },
    {
      query: 'fullmetal alchemist brotherhood',
      expected: 'Fullmetal Alchemist: Brotherhood',
      expectedPositionRange: [0, 0],
    },
    { query: 'lion king', expected: 'The Lion King', expectedPositionRange: [0, 0] },
    { query: 'finding nemo', expected: 'Finding Nemo', expectedPositionRange: [0, 0] },
    { query: 'dragon ball z', expected: 'Dragon Ball Z', expectedPositionRange: [0, 0] },
    { query: 'cowboy bebop', expected: 'Cowboy Bebop', expectedPositionRange: [0, 0] },
    { query: 'guardians of galaxy', expected: "Marvel's Guardians of the Galaxy", expectedPositionRange: [0, 0] },
    { query: 'avengers endgame', expected: 'Avengers: Endgame', expectedPositionRange: [0, 0] },
    { query: 'howl moving castle', expected: "Howl's Moving Castle", expectedPositionRange: [0, 0] },
    { query: 'spiderman homecoming', expected: 'Spider-Man: Homecoming', expectedPositionRange: [0, 0] },
    { query: 'demon slayer', expected: 'Demon Slayer: Kimetsu no Yaiba', expectedPositionRange: [0, 0] },
    { query: 'joker', expected: 'Joker', expectedPositionRange: [0, 0] },
    { query: 'interstellar', expected: 'Interstellar', expectedPositionRange: [0, 0] },
    {
      query: 'pirates caribbean black pearl',
      expected: 'Pirates of the Caribbean: The Curse of the Black Pearl',
      expectedPositionRange: [0, 0],
    },
    { query: 'batman dark knight', expected: 'The Dark Knight', expectedPositionRange: [0, 0] },
    { query: 'mad max fury road', expected: 'Mad Max: Fury Road', expectedPositionRange: [0, 0] },
    { query: 'the shawshank redemption', expected: 'The Shawshank Redemption', expectedPositionRange: [0, 0] },
    { query: 'pulp fiction', expected: 'Pulp Fiction', expectedPositionRange: [0, 0] },
    { query: 'forrest gump', expected: 'Forrest Gump', expectedPositionRange: [0, 0] },
    { query: 'the godfather', expected: 'The Godfather', expectedPositionRange: [0, 0] },
    { query: 'fight club', expected: 'Fight Club', expectedPositionRange: [0, 0] },
    { query: 'the incredibles', expected: 'The Incredibles', expectedPositionRange: [0, 0] },
    { query: 'incredibles 2', expected: 'Incredibles 2', expectedPositionRange: [0, 0] },
    { query: 'big hero 6', expected: 'Big Hero 6', expectedPositionRange: [0, 0] },
    { query: 'zootopia', expected: 'Zootopia', expectedPositionRange: [0, 0] },
    { query: 'up', expected: 'Up', expectedPositionRange: [0, 0] },
    { query: 'inside out', expected: 'Inside Out', expectedPositionRange: [0, 0] },
    { query: 'coco', expected: 'Coco', expectedPositionRange: [0, 0] },
    { query: 'black panther', expected: 'Black Panther', expectedPositionRange: [0, 0] },
    { query: 'the avengers', expected: 'The Avengers', expectedPositionRange: [0, 0] },
    { query: 'doctor strange', expected: 'Doctor Strange', expectedPositionRange: [0, 0] },
    { query: 'star wars rogue one', expected: 'Rogue One: A Star Wars Story', expectedPositionRange: [0, 0] },
    { query: 'jurassic park', expected: 'Jurassic Park', expectedPositionRange: [0, 0] },
    { query: 'raiders of the lost ark', expected: 'Raiders of the Lost Ark', expectedPositionRange: [0, 0] },
    { query: 'mission impossible fallout', expected: 'Mission: Impossible - Fallout', expectedPositionRange: [0, 0] },
    { query: 'the martian', expected: 'The Martian', expectedPositionRange: [0, 0] },
    { query: 'good will hunting', expected: 'Good Will Hunting', expectedPositionRange: [0, 0] },
    { query: 'the departed', expected: 'The Departed', expectedPositionRange: [0, 0] },
    { query: 'gladiator', expected: 'Gladiator', expectedPositionRange: [0, 0] },
    { query: 'schindler list', expected: "Schindler's List", expectedPositionRange: [0, 0] },
    { query: 'seven samurai', expected: 'Seven Samurai', expectedPositionRange: [0, 0] },
    { query: 'in the mood for love', expected: 'In the Mood for Love', expectedPositionRange: [0, 0] },
    { query: 'whiplash', expected: 'Whiplash', expectedPositionRange: [0, 0] },
    { query: 'parasite', expected: 'Parasite', expectedPositionRange: [0, 0] },
    { query: 'la la land', expected: 'La La Land', expectedPositionRange: [0, 0] },
    { query: 'moonlight', expected: 'Moonlight', expectedPositionRange: [0, 0] },
    { query: 'tokyo revengers', expected: 'Tokyo Revengers', expectedPositionRange: [0, 0] },
    { query: 'grand budapest hotel', expected: 'The Grand Budapest Hotel', expectedPositionRange: [0, 0] },
    { query: 'life of pi', expected: 'Life of Pi', expectedPositionRange: [0, 0] },
    { query: 'a beautiful mind', expected: 'A Beautiful Mind', expectedPositionRange: [0, 0] },
    { query: 'gone girl', expected: 'Gone Girl', expectedPositionRange: [0, 0] },
    { query: 'the social network', expected: 'The Social Network', expectedPositionRange: [0, 0] },
    { query: '12 years a slave', expected: '12 Years a Slave', expectedPositionRange: [0, 0] },
    { query: 'django unchained', expected: 'Django Unchained', expectedPositionRange: [0, 0] },
    { query: 'the imitation game', expected: 'The Imitation Game', expectedPositionRange: [0, 0] },
    { query: 'gravity falls', expected: 'Gravity Falls', expectedPositionRange: [0, 0] },
    { query: 'the theory of everything', expected: 'The Theory of Everything', expectedPositionRange: [0, 0] },
    { query: 'bohemian rhapsody', expected: 'Bohemian Rhapsody', expectedPositionRange: [0, 0] },
    { query: 'the wolf of wall street', expected: 'The Wolf of Wall Street', expectedPositionRange: [0, 0] },
    { query: 'joker', expected: 'Joker', expectedPositionRange: [0, 0] },
    { query: 'blade runner 2049', expected: 'Blade Runner 2049', expectedPositionRange: [0, 0] },
    { query: 'mad max fury road', expected: 'Mad Max: Fury Road', expectedPositionRange: [0, 0] },
    { query: 'logan', expected: 'Logan', expectedPositionRange: [0, 0] },
    { query: 'the shape of water', expected: 'The Shape of Water', expectedPositionRange: [0, 0] },
    { query: 'call me by your name', expected: 'Call Me by Your Name', expectedPositionRange: [0, 0] },
    { query: 'lady bird', expected: 'Lady Bird', expectedPositionRange: [0, 0] },
    { query: 'black swan', expected: 'Black Swan', expectedPositionRange: [0, 0] },
    { query: 'arrival', expected: 'Arrival', expectedPositionRange: [0, 0] },
    { query: 'ex machina', expected: 'Ex Machina', expectedPositionRange: [0, 0] },
    { query: 'neon genesis evangelion', expected: 'Neon Genesis Evangelion', expectedPositionRange: [0, 0] },
    { query: 'princess mononoke', expected: 'Princess Mononoke', expectedPositionRange: [0, 0] },
    { query: 'steins gate', expected: 'Steins;Gate', expectedPositionRange: [0, 0] },
    { query: 'hunter x hunter', expected: 'Hunter x Hunter', expectedPositionRange: [0, 0] },
    { query: 'bleach', expected: 'Bleach', expectedPositionRange: [0, 0] },
    { query: 'one punch man', expected: 'One-Punch Man', expectedPositionRange: [0, 0] },
    { query: 'tokyo ghoul', expected: 'Tokyo Ghoul', expectedPositionRange: [0, 0] },
    { query: 'sword art online', expected: 'Sword Art Online', expectedPositionRange: [0, 0] },
    { query: 'cowboy bebop', expected: 'Cowboy Bebop', expectedPositionRange: [0, 0] },
    { query: 'the promised neverland', expected: 'The Promised Neverland', expectedPositionRange: [0, 0] },
    { query: 'fate zero', expected: 'Fate/Zero', expectedPositionRange: [0, 0] },
    { query: 'your lie in april', expected: 'Your Lie in April', expectedPositionRange: [0, 0] },
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
