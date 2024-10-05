import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { MovieSearchResultDTO } from '../movies/dto/movie-search-result.dto';
import {
  LIBRARY_CONTROLLER_BASE_PATH,
  LIBRARY_CONTROLLER_VERSION,
  LIBRARY_SWAGGER_TAG,
  Providers,
} from './library.constants';
import { LibraryService } from './library.service';

@ApiTags(LIBRARY_SWAGGER_TAG)
@Controller({
  path: LIBRARY_CONTROLLER_BASE_PATH,
  version: LIBRARY_CONTROLLER_VERSION,
})
export class LibraryController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly libraryService: LibraryService) {}

  @Get('search')
  @ApiQuery({ name: 'types', required: true, type: String })
  @ApiQuery({ name: 'providers', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'query', required: true, type: String, example: 'shrek' })
  public async search(
    @Query('types') types: string,
    @Query('providers') providers: string,
    @Query('limit') limit: number,
    @Query('query') query: string,
  ): Promise<MovieSearchResultDTO> {
    this.logger.log(
      `Received search request with types: ${types}, providers: ${providers}, query: ${query}, limit: ${limit}`,
    );

    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }

    if (limit !== undefined && (limit < 1 || limit > 100)) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const providersList: Providers[] = [];
    for (const provider of providers.split(',')) {
      if (Object.keys(Providers).includes(provider)) {
        providersList.push(provider as Providers);
      } else {
        throw new BadRequestException(`Invalid provider ${provider}`);
      }
    }

    return this.libraryService.searchByName(query, providersList, [TitleType.MOVIE], limit);
  }
}
