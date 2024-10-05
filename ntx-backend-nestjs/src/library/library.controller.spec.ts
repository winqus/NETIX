import { Test, TestingModule } from '@nestjs/testing';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import { Providers } from './library.constants';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

describe('LibraryController', () => {
  let controller: LibraryController;
  let externalTitleSearchService: LibraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [
        {
          provide: LibraryService,
          useValue: {
            searchByName: jest.fn().mockResolvedValue([
              {
                providerID: 'ntx',
                resultWeight: 1,
                shortMovieMetadata: {
                  title: 'Shrek',
                  type: 'MOVIE',
                  releaseDate: '2001-05-18',
                  posterID: 'some-poster-id',
                },
              },
            ] as MovieSearchResultDTO[]),
          },
        },
      ],
    }).compile();

    controller = module.get<LibraryController>(LibraryController);
    externalTitleSearchService = module.get<LibraryService>(LibraryService);
  });

  it('should call searchByName when provider is ntx', async () => {
    const result = await controller.search('MOVIE', 'ntx', 10, 'shrek');
    expect(externalTitleSearchService.searchByName).toHaveBeenCalledWith('shrek', Providers.NTX);
    expect(result).toEqual([
      {
        providerID: 'ntx',
        resultWeight: 1,
        shortMovieMetadata: {
          title: 'Shrek',
          type: 'MOVIE',
          releaseDate: '2001-05-18',
          posterID: 'some-poster-id',
        },
      },
    ]);
  });

  it('should throw BadRequestException when query is missing', async () => {
    await expect(controller.search('MOVIE', 'ntx', 10, '')).rejects.toThrowError('Query parameter is required');
  });

  it('should throw BadRequestException for unsupported providers', async () => {
    await expect(controller.search('MOVIE', 'unsupported-provider', 10, 'shrek')).rejects.toThrowError(
      'Unsupported provider for search',
    );
  });
});
