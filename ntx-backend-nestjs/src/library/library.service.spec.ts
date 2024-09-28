import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import { MoviesService } from '../movies/movies.service';
import { ExternalProviders } from './library.constants';
import { ExternalTitleSearchService } from './library.service'; // Adjust the path accordingly

describe('ExternalTitleSearchService', () => {
  let service: ExternalTitleSearchService;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalTitleSearchService,
        {
          provide: MoviesService,
          useValue: {
            findAllByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalTitleSearchService>(ExternalTitleSearchService);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAllByName when provider is NTX', async () => {
    const query = 'shrek';
    const provider = ExternalProviders.NTX;
    const movieSearchResult: MovieSearchResultDTO[] = [
      {
        providerID: 'ntx',
        resultWeight: 1,
        shortMovieMetadata: {
          title: 'Shrek',
          type: TitleType.MOVIE,
          releaseDate: '2001-05-18',
          posterID: 'some-poster-id',
        },
      },
    ];

    jest.spyOn(moviesService, 'findAllByName').mockResolvedValue(movieSearchResult);

    const result = await service.searchByName(query, provider);

    expect(moviesService.findAllByName).toHaveBeenCalledWith(query);
    expect(result).toEqual(movieSearchResult);
  });

  it('should return hardcoded result when provider is not NTX', async () => {
    const query = 'shrek';
    const provider = 'other_provider';
    const expectedMovieSearchResult: MovieSearchResultDTO[] = [
      {
        providerID: 'ntx',
        resultWeight: 1,
        shortMovieMetadata: {
          title: 'Shrek',
          type: TitleType.MOVIE,
          releaseDate: '2001-05-18',
          posterID: 'some-poster-id',
        },
      },
    ];

    const result = await service.searchByName(query, provider as any);

    expect(moviesService.findAllByName).not.toHaveBeenCalled();
    expect(result).toEqual(expectedMovieSearchResult);
  });

  it('should log search query and provider', async () => {
    const query = 'shrek';
    const provider = ExternalProviders.NTX;

    const loggerSpy = jest.spyOn(Logger.prototype, 'log');

    await service.searchByName(query, provider);

    expect(loggerSpy).toHaveBeenCalledWith(`Searching movie by name: ${query} for provider: ${provider}`);
  });
});
