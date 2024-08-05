import { TestBed } from '@automock/jest';
import { Logger } from '@nestjs/common';
import mockLoggerProperty from '@ntx-test/utils/mockLoggerProperty';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import 'reflect-metadata';
import { NameCategory } from '../interfaces/nameCategory.enum';
import { CreateMovieTitleDTO } from './dto/CreateMovieTitle.dto';
import { MovieTitle } from './interfaces/movieTitle.interface';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

jest.mock('@ntx/utility/generateUUIDv4');

describe('MoviesService', () => {
  let service: MoviesService;
  let mockRepository: jest.Mocked<MoviesRepository>;
  let mockLogger: jest.Mocked<Logger>;
  const fixedDate = new Date('2023-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedDate);

    const { unit, unitRef } = TestBed.create(MoviesService).compile();

    service = unit;
    mockRepository = unitRef.get(MoviesRepository);

    mockLogger = mockLoggerProperty(service);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockLogger).toBeDefined();
    expect(mockRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new movie title successfully', async () => {
      const createDTO = new CreateMovieTitleDTO();
      createDTO.names = [{ type: NameCategory.Primary, value: 'Movie Name', language: 'en' }];
      createDTO.releaseDate = new Date();
      createDTO.runtimeMinutes = 120;

      const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
      (generateUUIDv4 as jest.Mock).mockReturnValue(mockUUID);
      const newTitle: MovieTitle = {
        ...createDTO,
        uuid: mockUUID,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        thumbnails: [],
        type: TitleType.MOVIE,
        video: undefined,
      };
      mockRepository.create.mockResolvedValueOnce(newTitle);

      const result = await service.create(createDTO);

      expect(generateUUIDv4).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(newTitle);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(newTitle);
    });

    it('should log and throw an error when validation fails', async () => {
      const createDTO = new CreateMovieTitleDTO();
      createDTO.names = ['Movie Name'] as any;
      createDTO.releaseDate = new Date();
      createDTO.runtimeMinutes = 44;

      try {
        await service.create(createDTO);
      } catch (error) {
        expect(error).toBeDefined();
      }
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });
  });
});
