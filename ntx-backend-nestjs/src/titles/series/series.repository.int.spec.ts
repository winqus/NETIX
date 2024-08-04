import { Test, TestingModule } from '@nestjs/testing';
import createBasicMongoMemoryServer from '@ntx-test/utils/createBasicMongoMemoryServer';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { DatabaseModule } from '@ntx/database/database.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NameCategory } from '../interfaces/nameCategory.enum';
import { titlesProviders } from '../titles.providers';
import { Episode } from './interfaces/episode.interface';
import { Season } from './interfaces/season.interface';
import { SeriesTitle } from './interfaces/seriesTitle.interface';
import { SeriesRepository } from './series.repository';

describe('SeriesRepository with seriesModel, mongodb-memory-server', () => {
  let mongod: MongoMemoryServer;
  let repository: SeriesRepository;

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
      providers: [...titlesProviders, SeriesRepository],
    }).compile();

    repository = module.get<SeriesRepository>(SeriesRepository);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a series title', async () => {
    const newSeries = await repository.create(someSeriesData);

    expect(newSeries.uuid).toBeDefined();
    expect(newSeries.type).toBe(TitleType.SERIES);
    expect(newSeries.seasons).toBeDefined();
    expect(newSeries.thumbnails).toBeDefined();
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

    const newSeries = await repository.create(someNewSeriesWithEpisodeData);

    expect(newSeries.uuid).toBeDefined();
    expect(newSeries.type).toBe(TitleType.SERIES);
    expect(newSeries.seasons).toBeDefined();
    expect(newSeries.seasons.length).toEqual(1);
    expect(newSeries.seasons[0].episodes).toBeDefined();
    expect(newSeries.seasons[0].episodes.length).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].episodeNumber).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].names.length).toEqual(1);
    expect(newSeries.seasons[0].episodes[0].runtimeMinutes).toEqual(30);
    expect(newSeries.seasons[0].episodes[0].thumbnails).toBeDefined();
    expect(newSeries.seasons[0].episodes[0].videos).toBeDefined();
  });
});
