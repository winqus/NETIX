import { Test, TestingModule } from '@nestjs/testing';
import createBasicMongoMemoryServer from '@ntx-test/utils/createBasicMongoMemoryServer';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { DatabaseModule } from '@ntx/database/database.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { NameCategory } from './interfaces/nameCategory.enum';
import { Title } from './interfaces/title.interface';
import { MovieTitle } from './movies/interfaces/movieTitle.interface';
import { Episode } from './series/interfaces/episode.interface';
import { Season } from './series/interfaces/season.interface';
import { SeriesTitle } from './series/interfaces/seriesTitle.interface';
import { MOVIE_TITLE_MODEL, SERIES_TITLE_MODEL, TITLE_MODEL } from './titles.constants';
import { titlesProviders } from './titles.providers';

describe('Title Model and subtypes with mongodb-memory-server', () => {
  let mongod: MongoMemoryServer;
  let titleModel: Model<Title & Document>;
  let movieModel: Model<MovieTitle & Document>;
  let seriesModel: Model<SeriesTitle & Document>;

  const someMovieData: MovieTitle = {
    names: [{ type: NameCategory.Primary, value: 'The Matrix', language: 'en' }],
    releaseDate: new Date('1999-03-31'),
    runtimeMinutes: 136,
  } as any;

  const someSeriesData: SeriesTitle = {
    names: [{ type: NameCategory.Primary, value: 'The Ballot', language: 'en' }],
    releaseDate: new Date('2000-01-31'),
  } as any;

  beforeAll(async () => {
    mongod = await createBasicMongoMemoryServer();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [...titlesProviders],
    }).compile();

    titleModel = module.get(TITLE_MODEL);
    movieModel = module.get(MOVIE_TITLE_MODEL);
    seriesModel = module.get(SERIES_TITLE_MODEL);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(titleModel).toBeDefined();
    expect(movieModel).toBeDefined();
    expect(seriesModel).toBeDefined();
  });

  it('should create a movie title', async () => {
    const newMovie = await movieModel.create(someMovieData);

    expect(newMovie.uuid).toBeDefined();
    expect(newMovie.type).toBe(TitleType.MOVIE);
    expect(newMovie.names.length).toEqual(1);
    expect(newMovie.runtimeMinutes).toBe(136);
    expect(newMovie.createdAt).toBeDefined();
    expect(newMovie.updatedAt).toBeDefined();
  });

  it('should create a series title with no seasons', async () => {
    const newSeries = await seriesModel.create(someSeriesData);

    expect(newSeries.uuid).toBeDefined();
    expect(newSeries.type).toBe(TitleType.SERIES);
    expect(newSeries.seasons).toBeDefined();
    expect(newSeries.releaseDate).toBeDefined();
    expect(newSeries.names.length).toEqual(1);
    expect(newSeries.createdAt).toBeDefined();
    expect(newSeries.updatedAt).toBeDefined();
  });

  it('should create a series title with a single episode', async () => {
    const someNewSeriesWithEpisodeData: SeriesTitle = {
      ...someSeriesData,
      seasons: [
        {
          seasonNumber: 1,
          names: [{ type: NameCategory.Primary, value: 'Season 1', language: 'en' }],
          releaseDate: new Date('2000-01-31'),
          episodes: [
            {
              episodeNumber: 1,
              names: [{ type: NameCategory.Primary, value: 'The Ballot Episode 1', language: 'en' }],
              runtimeMinutes: 30,
            } as Episode,
          ],
        } as Season,
      ],
    };

    const newSeries = await seriesModel.create(someNewSeriesWithEpisodeData);

    expect(newSeries.uuid).toBeDefined();
    expect(newSeries.type).toBe(TitleType.SERIES);
    expect(newSeries.seasons).toBeDefined();
    expect(newSeries.seasons.length).toEqual(1);
    expect(newSeries.seasons[0].episodes).toBeDefined();
    expect(newSeries.seasons[0].episodes.length).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].episodeNumber).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].names.length).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].runtimeMinutes).toEqual(30);
    expect(newSeries.seasons[0].episodes[0].thumbnail).toBeDefined();
  });

  it(`should create get at least 2 titles`, async () => {
    await movieModel.create(someMovieData);
    await seriesModel.create(someSeriesData);

    const titles = await titleModel.find().exec();

    expect(titles.length).toBeGreaterThanOrEqual(2);
  });
});
