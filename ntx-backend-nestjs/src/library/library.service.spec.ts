import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import { MoviesService } from '../movies/movies.service';
import { SearchResultDTO } from './dto/search-result-dto';
import { Providers } from './library.constants';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let moviesService: MoviesService;
  let externalTitleService: ExternalTitleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibraryService,
        {
          provide: MoviesService,
          useValue: {
            findAllByName: jest.fn(),
          },
        },
        {
          provide: ExternalTitleService,
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
    moviesService = module.get<MoviesService>(MoviesService);
    externalTitleService = module.get<ExternalTitleService>(ExternalTitleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAllByName when provider includes NTX', async () => {
    const query = 'shrek';
    const providers = [Providers.NTX];
    const types = [TitleType.MOVIE];
    const limit = 10;

    const movieSearchResult: MovieSearchResultDTO = {
      size: 1,
      results: [
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek',
            originalName: 'Shrek',
            summary: 'An ogre story',
            releaseDate: '2001-05-18',
            runtimeMinutes: 90,
          },
          weight: 1,
          posterURL: 'poster-url',
          backdropURL: 'backdrop-url',
        },
      ],
    };

    jest.spyOn(moviesService, 'findAllByName').mockResolvedValue([movieSearchResult]);

    const result = await service.searchByName(query, providers, types, limit);

    expect(moviesService.findAllByName).toHaveBeenCalledWith(query);
    expect(result.size).toEqual(1);
    expect(result.searchResults[0].results).toEqual(movieSearchResult.results);
  });

  it('should call ExternalTitleService when provider includes NTX_DISCOVERY', async () => {
    const query = 'shrek';
    const providers = [Providers.NTX_DISCOVERY];
    const types = [TitleType.MOVIE];
    const limit = 10;

    const externalSearchResult = {
      size: 1,
      results: [
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek',
            originalName: 'Shrek',
            summary: 'An ogre story',
            releaseDate: '2001-05-18',
            runtime: 90,
          },
          weight: 1,
          posterURL: 'poster-url',
          backdropURL: 'backdrop-url',
          providerID: 'provider-id',
          externalID: 'external-id',
        },
      ],
    };

    jest.spyOn(externalTitleService, 'search').mockResolvedValue(externalSearchResult);

    const result = await service.searchByName(query, providers, types, limit);

    expect(externalTitleService.search).toHaveBeenCalledWith({
      query,
      types,
      maxResults: limit,
    });
    expect(result.searchResults[1].results.length).toBeGreaterThan(0);
    expect(result.searchResults[1].results[0].metadata.name).toEqual('Shrek');
  });

  it('should limit the results to the provided limit', async () => {
    const query = 'shrek';
    const providers = [Providers.NTX];
    const types = [TitleType.MOVIE];
    const limit = 1;

    const movieSearchResult: MovieSearchResultDTO = {
      size: 2,
      results: [
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek',
            originalName: 'Shrek',
            summary: 'An ogre story',
            releaseDate: '2001-05-18',
            runtimeMinutes: 90,
          },
          weight: 1,
          posterURL: 'poster-url',
          backdropURL: 'backdrop-url',
        },
        {
          type: TitleType.MOVIE,
          metadata: {
            name: 'Shrek 2',
            originalName: 'Shrek 2',
            summary: 'Another ogre story',
            releaseDate: '2004-05-19',
            runtimeMinutes: 92,
          },
          weight: 0.9,
          posterURL: 'poster-url-2',
          backdropURL: 'backdrop-url-2',
        },
      ],
    };

    jest.spyOn(moviesService, 'findAllByName').mockResolvedValue([movieSearchResult]);

    const result = await service.searchByName(query, providers, types, limit);

    expect(result.size).toEqual(limit);
    expect(result.searchResults[0].results.length).toEqual(limit);
  });

  it('should log search query and providers', async () => {
    const query = 'shrek';
    const providers = [Providers.NTX];
    const types = [TitleType.MOVIE];
    const limit = 10;

    const loggerSpy = jest.spyOn(Logger.prototype, 'log');

    jest.spyOn(moviesService, 'findAllByName').mockResolvedValue([]);

    await service.searchByName(query, providers, types, limit);

    expect(loggerSpy).toHaveBeenCalledWith(`Searching movie by name: ${query} for provider: ${providers}`);
  });

  it('should resolve with empty results for invalid provider', async () => {
    const query = 'shrek';
    const invalidProvider = ['INVALID_PROVIDER'] as any;
    const types = [TitleType.MOVIE];
    const limit = 10;

    const expectedResult: SearchResultDTO = {
      size: 0,
      searchResults: [
        { id: 'ntx', size: 0, results: [] },
        { id: 'ntx-discovery', size: 0, results: [] },
      ],
    };

    const result = await service.searchByName(query, invalidProvider, types, limit);

    expect(result).toEqual(expectedResult);
  });
});
