import { Body, Controller, HttpException, Logger, NotFoundException, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { ImportMovieDTO } from './dto/import-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import {
  MOVIES_IMPORT_CONTROLLER_BASE_PATH,
  MOVIES_IMPORT_CONTROLLER_VERSION,
  MOVIES_SWAGGER_TAG,
} from './movies.constants';
import { MoviesService } from './movies.service';
import { ApiDocsForImportMovie } from './swagger/api-docs.decorators';

@ApiTags(MOVIES_SWAGGER_TAG)
@Controller({
  path: MOVIES_IMPORT_CONTROLLER_BASE_PATH,
  version: MOVIES_IMPORT_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class MoviesImportController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly moviesSrv: MoviesService,
    private readonly externalTitles: ExternalTitleService,
  ) {}

  @Post()
  @ApiDocsForImportMovie()
  public async import(@Body() dto: ImportMovieDTO): Promise<MovieDTO> {
    try {
      await validateOrReject(dto);

      const externalTitleMetadata = await this.externalTitles.getTitleMetadata({
        providerID: dto.externalProviderID,
        externalID: dto.externalID,
        type: TitleType.MOVIE,
      });

      if (externalTitleMetadata == null) {
        throw new NotFoundException('External title not found');
      }

      const createMovieDTO = new CreateMovieDTO();
      createMovieDTO.name = externalTitleMetadata.metadata.name;
      createMovieDTO.originallyReleasedAt = new Date(externalTitleMetadata.metadata.releaseDate);
      createMovieDTO.summary = externalTitleMetadata.metadata.summary;
      createMovieDTO.runtimeMinutes = externalTitleMetadata?.metadata.runtime;

      const newMovie = await this.moviesSrv.createOne(createMovieDTO);

      this.logger.log(`Created new movie ${newMovie.id} with poster ${newMovie.posterID}`);

      return newMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
