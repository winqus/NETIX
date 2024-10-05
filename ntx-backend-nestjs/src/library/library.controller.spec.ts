import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import { MoviesService } from '../movies/movies.service';
import { Providers } from './library.constants';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

describe('LibraryController', () => {
  let controller: LibraryController;
  let libraryService: LibraryService;

  beforeEach(async () => {
    const mockMoviesService = {
      findAllByName: jest.fn().mockResolvedValue({
        size: 1,
        results: [
          {
            type: TitleType.MOVIE,
            metadata: {
              name: 'Shrek',
              releaseDate: '2001-05-18',
              runtimeMinutes: 90,
            },
            weight: 1,
            posterURL: 'some-poster-url',
          },
        ],
      }),
    };

    const mockExternalTitleService = {
      search: jest.fn().mockResolvedValue({
        results: [
          {
            type: TitleType.MOVIE,
            metadata: {
              name: 'Shrek 2',
              releaseDate: '2004-05-19',
              runtime: 105,
              summary: 'Shrek returns...',
            },
            weight: 2,
            posterURL: 'some-poster-url-2',
            backdropURL: 'some-backdrop-url',
          },
        ],
      }),
    };

    const mockLibraryService = {
      searchByName: jest.fn().mockImplementation((query, providers, types, limit) => {
        if (providers.includes(Providers.NTX)) {
          return Promise.resolve({
            size: 1,
            results: [
              {
                type: TitleType.MOVIE,
                metadata: {
                  name: 'Shrek',
                  releaseDate: '2001-05-18',
                  runtimeMinutes: 90,
                },
                weight: 1,
                posterURL: 'some-poster-url',
              },
            ],
          });
        } else if (providers.includes(Providers.NTX_DISCOVERY)) {
          return Promise.resolve({
            size: 1,
            results: [
              {
                type: TitleType.MOVIE,
                metadata: {
                  name: 'Shrek 2',
                  releaseDate: '2004-05-19',
                  runtimeMinutes: 105,
                  summary: 'Shrek returns...',
                },
                weight: 2,
                posterURL: 'some-poster-url-2',
                backdropURL: 'some-backdrop-url',
              },
            ],
          });
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: ExternalTitleService, useValue: mockExternalTitleService },
      ],
    }).compile();

    controller = module.get<LibraryController>(LibraryController);
    libraryService = module.get<LibraryService>(LibraryService);
  });

  it('should call searchByName when provider is NTX', async () => {
    const result = await controller.search('MOVIE', 'NTX', 10, 'shrek');

    expect(libraryService.searchByName).toHaveBeenCalledWith('shrek', [Providers.NTX], [TitleType.MOVIE], 10);
    expect(result).toEqual({
      size: 1,
      results: [
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek',
            releaseDate: '2001-05-18',
            runtimeMinutes: 90,
          },
          weight: 1,
          posterURL: 'some-poster-url',
        },
      ],
    });
  });

  it('should call searchByName with NTX_DISCOVERY provider', async () => {
    const result = await controller.search('MOVIE', 'NTX_DISCOVERY', 10, 'shrek');

    expect(libraryService.searchByName).toHaveBeenCalledWith('shrek', [Providers.NTX_DISCOVERY], [TitleType.MOVIE], 10);
    expect(result).toEqual({
      size: 1,
      results: [
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek 2',
            releaseDate: '2004-05-19',
            runtimeMinutes: 105,
            summary: 'Shrek returns...',
          },
          weight: 2,
          posterURL: 'some-poster-url-2',
          backdropURL: 'some-backdrop-url',
        },
      ],
    });
  });

  it('should throw BadRequestException when query is missing', async () => {
    await expect(controller.search('MOVIE', 'NTX', 10, '')).rejects.toThrowError(BadRequestException);
  });

  it('should throw BadRequestException for invalid provider', async () => {
    await expect(controller.search('MOVIE', 'unsupported-provider', 10, 'shrek')).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when limit is invalid', async () => {
    await expect(controller.search('MOVIE', 'NTX', 101, 'shrek')).rejects.toThrowError(BadRequestException);
    await expect(controller.search('MOVIE', 'NTX', 0, 'shrek')).rejects.toThrowError(BadRequestException);
  });
});
