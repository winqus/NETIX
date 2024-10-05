import { Inject, Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalMovieMetadata } from '@ntx/external-providers/external-providers.types';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { MovieSearchResultDTO, MovieSearchResultItem } from '../movies/dto/movie-search-result.dto';
import { MoviesService } from '../movies/movies.service';
import { Providers } from './library.constants';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject() private readonly moviesService: MoviesService,
    @Inject() private readonly extTitlesService: ExternalTitleService,
  ) {}

  public async searchByName(
    query: string,
    providers: Providers[],
    types: TitleType[],
    limit: number,
  ): Promise<MovieSearchResultDTO> {
    this.logger.log(`Searching movie by name: ${query} for provider: ${providers}`);
    const resultDto: MovieSearchResultDTO = { size: 0, results: [] };

    if (providers.includes(Providers.NTX)) {
      const moviesResults = await this.moviesService.findAllByName(query);
      moviesResults.forEach((movieResult) => {
        resultDto.results.push(...movieResult.results);
        resultDto.size += movieResult.size;
      });
    }

    if (providers.includes(Providers.NTX_DISCOVERY)) {
      const extResults = await this.extTitlesService.search({
        query: query,
        types: types,
        maxResults: limit,
      });

      const movieResults = extResults.results
        .filter((result) => result.type === TitleType.MOVIE)
        .map((result) => {
          const metadata = result.metadata as ExternalMovieMetadata;

          const movieResultItem: MovieSearchResultItem = {
            type: TitleType.MOVIE,
            metadata: {
              name: metadata.name,
              originalName: metadata.originalName,
              summary: metadata.summary,
              releaseDate: metadata.releaseDate,
              runtimeMinutes: metadata.runtime ?? 0,
            },
            weight: result.weight,
            posterURL: result.posterURL,
            backdropURL: result.backdropURL,
          };

          return movieResultItem;
        });

      resultDto.results.push(...movieResults);
      resultDto.size += movieResults.length;
    }

    resultDto.results.sort((a, b) => b.weight - a.weight);

    resultDto.results = resultDto.results.slice(0, limit);
    resultDto.size = resultDto.results.length;

    return resultDto;
  }
}
