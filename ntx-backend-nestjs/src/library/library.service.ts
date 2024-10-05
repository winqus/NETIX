import { Inject, Injectable, Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { MoviesService } from '../movies/movies.service';
import { SearchResultDTO } from './dto/search-result-dto';
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
  ): Promise<SearchResultDTO> {
    this.logger.log(`Searching movie by name: ${query} for provider: ${providers}`);
    const resultDto: SearchResultDTO = {
      size: 0,
      searchResults: [
        { id: 'ntx', size: 0, results: [] },
        { id: 'ntx-discovery', size: 0, results: [] },
      ],
    };

    if (providers.includes(Providers.NTX)) {
      const moviesResults = await this.moviesService.findAllByName(query);
      moviesResults.forEach((movieResult) => {
        resultDto.searchResults[0].results.push(...movieResult.results);
        resultDto.searchResults[0].size += movieResult.size;
        resultDto.size += movieResult.size;
      });
    }

    if (providers.includes(Providers.NTX_DISCOVERY)) {
      const extResults = await this.extTitlesService.search({
        query: query,
        types: types,
        maxResults: limit,
      });

      resultDto.searchResults[1].results.push(...extResults.results);
      resultDto.searchResults[1].size += extResults.size;
      resultDto.size += extResults.size;
    }

    resultDto.size = 0;
    resultDto.searchResults.forEach((searchResult) => {
      searchResult.results.sort((a, b) => b.weight - a.weight);
      searchResult.results = searchResult.results.slice(0, limit);
      searchResult.size = searchResult.results.length;
      resultDto.size += searchResult.size;
    });

    return resultDto;
  }
}
