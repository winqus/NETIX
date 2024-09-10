import { TestBed } from '@automock/jest';
import { Logger } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import createBasicMongoMemoryServer from '@ntx-test/utils/createBasicMongoMemoryServer';
import mockLoggerProperty from '@ntx-test/utils/mockLoggerProperty';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalTitleSearchService } from '@ntx/external-search/external-title-search.service';
import { ImportedInformationService } from '@ntx/external-search/imported-information.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'reflect-metadata';
import { titlesProviders } from '../titles.providers';
import { MoviesController } from './movies.controller';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let mongoServer: MongoMemoryServer;
  let moviesController: MoviesController;
  let moviesService: MoviesService;
  let moviesRepository: MoviesRepository;
  let mockLogger: jest.Mocked<Logger>;
  let _mockImportedInfoService: jest.Mocked<ImportedInformationService>;
  let _mockExtTitleSearchServiceService: jest.Mocked<ExternalTitleSearchService>;
  // let _mockEventEmitter: jest.Mocked<EventEmitter2>;
  // const fixedDate = new Date('2023-01-01T00:00:00Z');

  beforeAll(async () => {
    mongoServer = await createBasicMongoMemoryServer();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    const importedInfoServiceBuild = TestBed.create(ImportedInformationService).compile();
    const externalTitleSearchServiceBuild = TestBed.create(ExternalTitleSearchService).compile();
    _mockImportedInfoService = importedInfoServiceBuild.unit as jest.Mocked<ImportedInformationService>;
    _mockExtTitleSearchServiceService = externalTitleSearchServiceBuild.unit as jest.Mocked<ExternalTitleSearchService>;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, EventEmitterModule.forRoot()],
      controllers: [MoviesController],
      providers: [
        ...titlesProviders,
        MoviesRepository,
        {
          provide: ImportedInformationService,
          useValue: importedInfoServiceBuild.unit,
        },
        {
          provide: ExternalTitleSearchService,
          useValue: externalTitleSearchServiceBuild.unit,
        },
        MoviesService,
      ],
    }).compile();

    moviesController = moduleRef.get(MoviesController);
    moviesRepository = moduleRef.get(MoviesRepository);
    moviesService = moduleRef.get(MoviesService);

    mockLogger = mockLoggerProperty(moviesController);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await mongoServer.stop();
  });

  it('should be defined', () => {
    expect(moviesController).toBeDefined();
    expect(mockLogger).toBeDefined();
    expect(moviesRepository).toBeDefined();
    expect(moviesService).toBeDefined();
  });
});
