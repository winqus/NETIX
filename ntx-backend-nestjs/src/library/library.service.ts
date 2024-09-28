import { Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import { MoviesService } from '../movies/movies.service';
import { ExternalProviders } from './library.constants';

@Injectable()
export class ExternalTitleSearchService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly moviesService: MoviesService) {}

  /**
   * Triggers search by movie name when provider is ntx.
   * @param query - The search query (e.g., "shrek")
   * @param provider - The provider to search from (e.g., 'ntx')
   * @returns MovieSearchResultDTO[] - The result DTO array for the movie search
   */
  public async searchByName(
    query: string,
    provider: (typeof ExternalProviders)[keyof typeof ExternalProviders],
  ): Promise<MovieSearchResultDTO[]> {
    this.logger.log(`Searching movie by name: ${query} for provider: ${provider}`);

    if (provider === ExternalProviders.NTX) {
      return await this.moviesService.findAllByName(query);
    } else {
      const movieSearchResult: MovieSearchResultDTO = {
        providerID: 'ntx',
        resultWeight: 1,
        shortMovieMetadata: {
          title: 'Shrek',
          type: TitleType.MOVIE,
          releaseDate: '2001-05-18',
          posterID: 'some-poster-id',
        },
      };

      return [movieSearchResult];
    }
  }
}
