import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { ExternalTitleMetadataResult } from '@ntx/external-providers/external-providers.types';
import { ExternalTitleService } from '../external-providers/external-title.service';
import { SearchResultDTO } from './dto/search-result-dto';
import {
  LIBRARY_CONTROLLER_BASE_PATH,
  LIBRARY_CONTROLLER_VERSION,
  LIBRARY_DEFAULT_SEARCH_LIMIT,
  LIBRARY_SWAGGER_TAG,
  Providers,
} from './library.constants';
import { LibraryService } from './library.service';
import { ApiDocsForGetExternalTitleMetadata, ApiDocsForSearch } from './swagger/api-docs.decorators';

@ApiTags(LIBRARY_SWAGGER_TAG)
@Controller({
  path: LIBRARY_CONTROLLER_BASE_PATH,
  version: LIBRARY_CONTROLLER_VERSION,
})
export class LibraryController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly libraryService: LibraryService,
    private readonly externalTitleService: ExternalTitleService,
  ) {}

  @Get('search')
  @ApiDocsForSearch()
  public async search(
    @Query('query') query: string,
    @Query('types', new DefaultValuePipe(TitleType.MOVIE), new ParseEnumPipe(TitleType)) types: string,
    @Query('providers', new DefaultValuePipe('NTX')) providers: string,
    @Query('limit') limit?: number,
  ): Promise<SearchResultDTO> {
    this.logger.log(
      `Received search request with types: ${types}, providers: ${providers}, query: ${query}, limit: ${limit}`,
    );

    if (!query || !query.trim()) {
      throw new BadRequestException('Query parameter is required');
    }

    limit = limit ?? LIBRARY_DEFAULT_SEARCH_LIMIT;

    if (limit < 1 || limit > 30) {
      throw new BadRequestException('Limit must be between 1 and 30');
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

  @Get('external-movies/:id/metadata')
  @ApiDocsForGetExternalTitleMetadata()
  public async getExternalTitleMetadata(
    @Param('id') id: string,
    @Query('providerID') providerID: string,
  ): Promise<ExternalTitleMetadataResult<TitleType>> {
    this.logger.log(`Fetching metadata for external ID: ${id}, provider: ${providerID}, type: MOVIE`);

    if (!id?.trim()) {
      throw new BadRequestException('ID parameter is required');
    }

    if (!providerID?.trim()) {
      throw new BadRequestException('Provider ID parameter is required');
    }

    const providersList: ExternalProviders[] = [];
    for (const provider of providerID.split(',')) {
      if (Object.keys(ExternalProviders).includes(provider)) {
        providersList.push(provider as ExternalProviders);
      } else {
        throw new BadRequestException(`Invalid provider: ${provider}`);
      }
    }

    const metadataRequest = {
      externalID: id.trim(),
      providerID: providerID.trim(),
      type: TitleType.MOVIE,
    };

    const result = await this.externalTitleService.getTitleMetadata(metadataRequest);

    if (!result) {
      throw new NotFoundException('Metadata not found');
    }

    return result;
  }
}
