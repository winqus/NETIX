import { Test, TestingModule } from '@nestjs/testing';
import createBasicMongoMemoryServer from '@ntx-test/utils/createBasicMongoMemoryServer';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { DatabaseModule } from '@ntx/database/database.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NameCategory } from '../interfaces/nameCategory.enum';
import { titlesProviders } from '../titles.providers';
import { MovieTitle } from './interfaces/movieTitle.interface';
import { MoviesRepository } from './movies.repository';

describe('MoviesRepository with movieModel, mongodb-memory-server', () => {
  let mongod: MongoMemoryServer;
  let moviesRepository: MoviesRepository;

  const someMovieData: MovieTitle = {
    names: [{ type: NameCategory.Primary, value: 'The Matrix', language: 'en' }],
    releaseDate: new Date('1999-03-31'),
    runtimeMinutes: 136,
  } as any;

  beforeAll(async () => {
    mongod = await createBasicMongoMemoryServer();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [...titlesProviders, MoviesRepository],
    }).compile();

    moviesRepository = module.get<MoviesRepository>(MoviesRepository);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(moviesRepository).toBeDefined();
  });

  it('should create a movie title', async () => {
    const newMovie = await moviesRepository.create(someMovieData);

    expect(newMovie.uuid).toBeDefined();
    expect(newMovie.type).toBe(TitleType.MOVIE);
    expect(newMovie.names.length).toEqual(1);
    expect(newMovie.runtimeMinutes).toBe(136);
    expect(newMovie.createdAt).toBeDefined();
    expect(newMovie.updatedAt).toBeDefined();
  });
});
